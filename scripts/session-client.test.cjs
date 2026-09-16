// Run: node --test scripts/session-client.test.cjs
// In-memory TS transpilation, deterministic timers and a minimal hook lifecycle.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function flush() { for (let i = 0; i < 40; i++) await Promise.resolve(); }
function events(extra = {}) {
  const listeners = new Map();
  return {
    ...extra,
    addEventListener(name, fn) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name).add(fn);
    },
    removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
    emit(name) { for (const fn of listeners.get(name) ?? []) fn(); },
    count() { return [...listeners.values()].reduce((n, set) => n + set.size, 0); },
  };
}
const token = (exp = 100000) => `header.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`;
const response = (json, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => json });
const session = (access = token()) => response({ user: { id: 1 }, access });

function setup(fetcher) {
  let now = 1000, timerID = 0, cursor = 0, writes = 0;
  const timers = new Map(), calls = [], slots = [], effects = [];
  const window = events(), document = events({ visibilityState: 'visible' });
  const navigator = { onLine: true };
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useContext: () => {},
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = initial;
      return [slots[i], (value) => { writes++; slots[i] = value; }];
    },
    useRef(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = { current: initial };
      return slots[i];
    },
    useCallback(fn) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = fn;
      return slots[i];
    },
    useEffect(fn) { effects.push(fn); },
  };
  const context = vm.createContext({
    window, document, navigator, AbortController, atob,
    Date: { now: () => now }, process: { env: { NEXT_PUBLIC_BASE_PATH: '/constructor' } },
    fetch(url, options) {
      calls.push({ url, ...options });
      return fetcher(calls.length, options);
    },
    setTimeout(fn, delay) {
      const id = ++timerID;
      timers.set(id, { fn, due: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  });
  const filename = path.join(__dirname, '../src/lib/session-client.tsx');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename,
  });
  const module = { exports: {} };
  vm.runInContext(`(function(require, module, exports) {\n${outputText}\n})`, context, { filename })(
    (name) => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }) };
      throw new Error(`Unexpected import ${name}`);
    }, module, module.exports,
  );
  let cleanup;
  const render = () => {
    cursor = 0;
    effects.length = 0;
    return module.exports.SessionProvider({ children: null }).props.value;
  };
  return {
    api: module.exports, calls, window, document, navigator,
    mount() { render(); cleanup = effects[0](); },
    unmount() { cleanup?.(); },
    // Replay effect setup/cleanup with preserved hooks, as in StrictMode.
    replay() { cleanup(); cleanup = effects[0](); },
    get state() { return render(); },
    get writes() { return writes; },
    get timerCount() { return timers.size; },
    jump(ms) { now += ms; },
    async tick(ms) {
      await flush();
      const target = now + ms;
      while (true) {
        const next = [...timers.entries()].filter(([, t]) => t.due <= target).sort((a, b) => a[1].due - b[1].due)[0];
        if (!next) break;
        now = next[1].due;
        timers.delete(next[0]);
        next[1].fn();
        await flush();
      }
      now = target;
      await flush();
    },
  };
}

for (const method of ['GET', 'POST']) {
  for (const stage of ['headers', 'body']) {
    test(`token: hung ${method} ${stage} aborts, releases shared promise and ignores stale completion`, async () => {
      const stale = deferred(), fresh = deferred();
      let stalled = false;
      const h = setup(async (_, options) => {
        if (stalled) return fresh.promise;
        if (options.method !== method) return session(token(0));
        stalled = true;
        return stage === 'headers' ? stale.promise : { ...response(null), json: () => stale.promise };
      });
      const old = h.api.getValidAccessToken();
      assert.equal(h.api.getValidAccessToken(), old);
      await flush();
      const oldSignal = h.calls.at(-1).signal;
      await h.tick(8000);
      assert.equal(await old, null);
      assert.equal(oldSignal.aborted, true);
      const current = h.api.getValidAccessToken();
      await flush();
      stale.resolve(stage === 'headers' ? session(token(0)) : { user: { id: 9 }, access: 'stale' });
      await flush();
      assert.equal(h.api.getValidAccessToken(), current);
      assert.equal(h.calls.length, method === 'GET' ? 2 : 3);
      fresh.resolve(session());
      assert.equal(await current, token());
      assert.equal(h.timerCount, 0);
      assert.ok(h.calls.every((call) => call.url === '/constructor/api/session' && call.cache === 'no-store'));
    });
  }
}

test('token: GET and POST share a total deadline including body reads', async () => {
  const get = deferred(), post = deferred();
  const h = setup(async (_, { method }) => method === 'GET' ? get.promise : { ...response(null), json: () => post.promise });
  const result = h.api.getValidAccessToken();
  await h.tick(6000);
  get.resolve(session(token(0)));
  await flush();
  assert.equal(h.calls.length, 2);
  await h.tick(2000);
  assert.equal(await result, null);
  assert.ok(h.calls.every((call) => call.signal.aborted));
  post.resolve({ access: 'late' });
  await flush();
});

test('token: expired access rotates; confirmed missing session never POSTs', async () => {
  const h = setup(async (_, { method }) => method === 'GET' ? session(token(0)) : response({ access: 'rotated' }));
  assert.equal(await h.api.getValidAccessToken(), 'rotated');
  assert.equal(h.calls.length, 2);
  for (const missing of [response({ user: null }), response(null, 401)]) {
    const absent = setup(async () => missing);
    assert.equal(await absent.api.getValidAccessToken(), null);
    assert.equal(absent.calls.length, 1);
  }
});

test('one-off getSession is bounded and rejects late success after suspended timers', async () => {
  const pending = deferred();
  const h = setup(() => pending.promise);
  const result = h.api.getSession();
  await flush();
  h.jump(8000);
  pending.resolve(session());
  assert.equal(await result, null);
  assert.equal(h.calls[0].signal.aborted, true);
  assert.equal(h.timerCount, 0);
});

for (const failure of [() => Promise.reject(new Error('offline')), () => response(null, 503), () => response({}), () => ({ ...response(null), json: async () => { throw new Error('invalid json'); } })]) {
  test('provider: transient bootstrap failure stays loading and automatically retries', async () => {
    const h = setup(async (n) => n === 1 ? failure() : session());
    h.mount();
    await flush();
    assert.equal(h.state.status, 'loading');
    await h.tick(1000);
    assert.equal(h.state.status, 'authenticated');
    assert.equal(h.state.data.user.access, token());
    h.unmount();
    assert.equal(h.timerCount, 0);
  });
}

test('provider: hung bootstrap body aborts and late unauth cannot overwrite retry success', async () => {
  const old = deferred();
  const h = setup(async (n) => n === 1 ? { ...response(null), json: () => old.promise } : session());
  h.mount();
  await h.tick(9000);
  assert.equal(h.calls[0].signal.aborted, true);
  assert.equal(h.state.status, 'authenticated');
  old.resolve({ user: null });
  await flush();
  assert.equal(h.state.status, 'authenticated');
  h.unmount();
});

test('provider: transient focus failure preserves auth; confirmed logout clears it', async () => {
  const h = setup(async (n) => n === 1 ? session() : n === 2 ? response(null, 500) : response({ user: null }));
  h.mount();
  await flush();
  h.window.emit('focus');
  await flush();
  assert.equal(h.state.status, 'authenticated');
  assert.equal(h.state.data.user.id, 1);
  await h.state.refresh();
  assert.equal(h.state.status, 'unauthenticated');
  assert.equal(h.state.data, null);
  await h.tick(60000);
  assert.equal(h.calls.length, 3);
  h.unmount();
});

test('provider: online/visible/focus recovery coalesces and respects offline/hidden state', async () => {
  const fresh = deferred();
  const h = setup(async (n) => n === 1 ? Promise.reject(new Error('offline')) : fresh.promise);
  h.mount();
  await flush();
  h.navigator.onLine = false;
  await h.tick(1000);
  h.window.emit('focus');
  h.document.emit('visibilitychange');
  assert.equal(h.calls.length, 1);
  h.navigator.onLine = true;
  h.document.visibilityState = 'hidden';
  h.window.emit('online');
  await flush();
  assert.equal(h.calls.length, 1);
  h.document.visibilityState = 'visible';
  h.document.emit('visibilitychange');
  h.window.emit('focus');
  h.window.emit('online');
  const refreshed = h.state.refresh();
  await flush();
  assert.equal(h.calls.length, 2);
  fresh.resolve(session());
  await refreshed;
  assert.equal(h.state.status, 'authenticated');
  h.unmount();
  assert.equal(h.window.count() + h.document.count(), 0);
  assert.equal(h.timerCount, 0);
});

for (const settle of ['resolve', 'reject']) {
  test(`provider: cleanup/replay isolates stale ${settle} and cancels timers/listeners`, async () => {
    const old = deferred(), fresh = deferred();
    const h = setup(async (n) => n === 1 ? old.promise : fresh.promise);
    h.mount();
    await flush();
    h.replay();
    await flush();
    assert.equal(h.calls[0].signal.aborted, true);
    old[settle](settle === 'resolve' ? response({ user: null }) : new Error('late'));
    await flush();
    assert.equal(h.writes, 0);
    h.window.emit('focus');
    await flush();
    assert.equal(h.calls.length, 2);
    fresh.resolve(session());
    await flush();
    assert.equal(h.state.status, 'authenticated');
    h.unmount();
    const writes = h.writes;
    await h.state.refresh();
    await h.tick(60000);
    assert.equal(h.writes, writes);
    assert.equal(h.window.count() + h.document.count(), 0);
    assert.equal(h.timerCount, 0);
  });
}

test('provider: confirmed missing session or 401 ends bootstrap without automatic retries', async () => {
  for (const missing of [response({ user: null }), response(null, 401)]) {
    const h = setup(async () => missing);
    h.mount();
    await h.tick(60000);
    assert.equal(h.state.status, 'unauthenticated');
    assert.equal(h.state.data, null);
    assert.equal(h.calls.length, 1);
    assert.equal(h.timerCount, 0);
    h.unmount();
  }
});

test('provider: unmount aborts pending body and prevents late state writes', async () => {
  const body = deferred();
  const h = setup(async () => ({ ...response(null), json: () => body.promise }));
  h.mount();
  await flush();
  h.unmount();
  assert.equal(h.calls[0].signal.aborted, true);
  body.resolve({ user: { id: 1 }, access: token() });
  await h.tick(60000);
  assert.equal(h.writes, 0);
  assert.equal(h.timerCount, 0);
  assert.equal(h.window.count() + h.document.count(), 0);
});

test('token: transient GET failure does not POST and next caller can retry', async () => {
  const h = setup(async (n) => n === 1 ? response(null, 503) : session());
  assert.equal(await h.api.getValidAccessToken(), null);
  assert.equal(await h.api.getValidAccessToken(), token());
  assert.equal(h.calls.length, 2);
  assert.ok(h.calls.every((call) => call.method === 'GET'));
});

test('provider: repeated transient errors back off; unmount cancels scheduled retry', async () => {
  const h = setup(async () => { throw new Error('offline'); });
  h.mount();
  await h.tick(1000);
  assert.equal(h.calls.length, 2);
  await h.tick(1000);
  assert.equal(h.calls.length, 2);
  await h.tick(1000);
  assert.equal(h.calls.length, 3);
  h.unmount();
  await h.tick(60000);
  assert.equal(h.calls.length, 3);
  assert.equal(h.timerCount, 0);
});
