// Run: node --test scripts/websocket-clients.test.cjs
// Transpile in memory using the existing compiler; no build artifacts or browser needed.
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

async function flush() {
  for (let i = 0; i < 12; i++) await Promise.resolve();
}

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

function setup(kind, provider) {
  let now = 1_000;
  let nextTimer = 0;
  let calls = 0;
  const timers = new Map();
  const sockets = [];
  const received = [];
  const window = events();
  const document = events({ visibilityState: 'visible' });
  const navigator = { onLine: true };

  class Socket {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    readyState = Socket.CONNECTING;
    onopen = null;
    onmessage = null;
    onerror = null;
    onclose = null;
    sent = [];
    closeCalls = 0;
    constructor(url) { this.url = url; sockets.push(this); }
    open() { this.readyState = Socket.OPEN; this.onopen?.({}); }
    send(data) { this.sent.push(data); }
    // Deliberately never emit close: recovery must not depend on it.
    close() { this.closeCalls++; this.readyState = Socket.CLOSING; }
    error() { this.onerror?.({}); }
    closed() { this.readyState = Socket.CLOSED; this.onclose?.({}); }
    message(data) { this.onmessage?.({ data }); }
  }

  const context = vm.createContext({
    WebSocket: Socket, window, document, navigator, URL,
    Date: { now: () => now },
    process: { env: {} },
    setInterval(fn, interval) {
      const id = ++nextTimer;
      timers.set(id, { fn, interval, due: now + interval });
      return id;
    },
    clearInterval(id) { timers.delete(id); },
  });
  const modules = new Map();
  const token = () => { calls++; return provider(calls); };
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const filename = path.join(__dirname, '..', relative);
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    });
    const module = { exports: {} };
    modules.set(relative, module.exports);
    const localRequire = (name) => {
      if (name === '@/services/instance') {
        return { instanceAuth: { get: async (url) => {
          assert.equal(url, '/projects/project-1/collab-token');
          return { data: { data: { token: await token() } } };
        } } };
      }
      if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
      return require(name);
    };
    vm.runInContext(`(function(require, module, exports) {\n${outputText}\n})`, context, { filename })(localRequire, module, module.exports);
    return module.exports;
  }
  let client, start, payload;
  if (kind === 'hub') {
    client = load('src/wss/ws-hub.ts').wsHub;
    client.subscribe((event, data) => received.push({ event, data }));
    start = () => client.start(token);
    payload = JSON.stringify({ event: 'debug_status', data: { active: true } });
  } else {
    const { CollabClient } = load('src/wss/collab/collab-client.ts');
    client = new CollabClient('project-1', (op) => received.push(op));
    start = () => client.start();
    // Use the real MessagePack/deflate codec, not a protocol substitute.
    const bytes = load('src/wss/collab/ops.ts').encodeOp({ t: 'nd', id: 'node-1' });
    payload = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  }
  return {
    client, start, sockets, received, payload, window, document, navigator,
    get calls() { return calls; },
    get timerCount() { return timers.size; },
    async tick(ms) {
      const target = now + ms;
      while (true) {
        const next = [...timers.values()].filter((timer) => timer.due <= target)
          .sort((a, b) => a.due - b.due)[0];
        if (!next) break;
        now = next.due;
        next.due += next.interval;
        next.fn();
        await flush();
      }
      now = target;
      await flush();
    },
    // Simulate a throttled background tab: wall time advances without watchdog ticks.
    jump(ms) { now += ms; },
  };
}

for (const kind of ['hub', 'collab']) {
  test(`${kind}: stalled token times out and late completion cannot replace fresh socket`, async (t) => {
    const stale = deferred();
    const h = setup(kind, (n) => n === 1 ? stale.promise : Promise.resolve('fresh'));
    t.after(() => h.client.stop());
    h.start();
    await h.tick(9_500);
    assert.equal(h.calls, 1);
    assert.equal(h.sockets.length, 0);
    await h.tick(1_000);
    assert.equal(h.calls, 2);
    assert.equal(h.sockets.length, 1);
    assert.ok(h.sockets[0].url.endsWith('?token=fresh'));
    h.sockets[0].open();
    stale.resolve('expired');
    await flush();
    assert.equal(h.sockets.length, 1);
    h.sockets[0].message(h.payload);
    assert.equal(h.received.length, 1);
  });

  for (const settle of ['resolve', 'reject']) {
    test(`${kind}: stop/start ignores stale token ${settle} without unlocking new attempt`, async (t) => {
      const old = deferred();
      const current = deferred();
      const h = setup(kind, (n) => n === 1 ? old.promise : current.promise);
      t.after(() => h.client.stop());
      h.start();
      h.client.stop();
      assert.equal(h.timerCount, 0);
      assert.equal(h.window.count() + h.document.count(), 0);
      h.start();
      old[settle](settle === 'resolve' ? 'old' : new Error('old failure'));
      await flush();
      await h.tick(1_000);
      assert.equal(h.calls, 2);
      assert.equal(h.sockets.length, 0);
      current.resolve('current');
      await flush();
      assert.equal(h.sockets.length, 1);
      assert.ok(h.sockets[0].url.endsWith('?token=current'));
    });
  }

  test(`${kind}: stopped pending token cannot create a socket`, async () => {
    const pending = deferred();
    const h = setup(kind, () => pending.promise);
    h.start();
    h.client.stop();
    pending.resolve('old');
    await flush();
    assert.equal(h.sockets.length, 0);
    assert.equal(h.timerCount, 0);
  });

  for (const opened of [false, true]) {
    test(`${kind}: error without close reconnects with fresh token (${opened ? 'open' : 'connecting'})`, async (t) => {
      const h = setup(kind, (n) => Promise.resolve(`token-${n}`));
      t.after(() => h.client.stop());
      h.start();
      await flush();
      const old = h.sockets[0];
      if (opened) old.open();
      const staleHandlers = { open: old.onopen, message: old.onmessage, error: old.onerror, close: old.onclose };
      old.error();
      assert.equal(old.closeCalls, 1);
      await h.tick(500);
      assert.equal(h.calls, 2);
      const current = h.sockets[1];
      assert.ok(current.url.endsWith('?token=token-2'));
      // Simulate already-queued callbacks, even though teardown detached handlers.
      staleHandlers.open({});
      staleHandlers.message({ data: h.payload });
      staleHandlers.error({});
      staleHandlers.close({});
      assert.equal(h.received.length, 0);
      assert.equal(current.closeCalls, 0);
      // Old open must not clear the new handshake's timeout/connecting lock.
      await h.tick(10_000);
      assert.equal(current.closeCalls, 1);
      assert.equal(h.sockets.length, 2);
      await h.tick(1_000);
      assert.equal(h.sockets.length, 3);
      h.sockets[2].open();
      h.sockets[2].message(h.payload);
      assert.equal(h.received.length, 1);
    });
  }

  test(`${kind}: total attempt budget includes token wait and handshake`, async (t) => {
    const pending = deferred();
    const h = setup(kind, (n) => n === 1 ? pending.promise : Promise.resolve('fresh'));
    t.after(() => h.client.stop());
    h.start();
    await h.tick(8_000);
    pending.resolve('slow');
    await flush();
    assert.equal(h.sockets.length, 1);
    await h.tick(2_000);
    assert.equal(h.sockets[0].closeCalls, 1);
    await h.tick(500);
    assert.equal(h.calls, 2);
  });

  test(`${kind}: late token and late open respect deadline while watchdog is suspended`, async (t) => {
    const pending = deferred();
    const h = setup(kind, (n) => n === 1 ? pending.promise : Promise.resolve('fresh'));
    t.after(() => h.client.stop());
    h.start();
    h.jump(10_000);
    pending.resolve('late');
    await flush();
    assert.equal(h.sockets.length, 0);
    h.window.emit('online');
    await flush();
    assert.equal(h.sockets.length, 1);
    h.jump(10_000);
    h.sockets[0].open();
    assert.equal(h.sockets[0].closeCalls, 1);
  });

  test(`${kind}: offline token attempt expires; online/visible recover without duplicates`, async (t) => {
    const h = setup(kind, (n) => n === 1 ? new Promise(() => {}) : Promise.resolve(`token-${n}`));
    t.after(() => h.client.stop());
    h.start();
    h.navigator.onLine = false;
    await h.tick(10_000);
    assert.equal(h.calls, 1);
    h.navigator.onLine = true;
    h.window.emit('online');
    h.document.emit('visibilitychange');
    await flush();
    assert.equal(h.calls, 2);
    h.sockets[0].open();
    h.window.emit('online');
    h.document.emit('visibilitychange');
    await flush();
    assert.equal(h.calls, 2);
    h.sockets[0].closed();
    h.document.visibilityState = 'hidden';
    h.document.emit('visibilitychange');
    await flush();
    assert.equal(h.calls, 2);
    h.document.visibilityState = 'visible';
    h.document.emit('visibilitychange');
    await flush();
    assert.equal(h.calls, 3);
    h.sockets[1].open();
    h.sockets[1].message(h.payload);
    assert.equal(h.received.length, 1);
  });

  test(`${kind}: repeated missing/rejected tokens back off and retry`, async (t) => {
    const h = setup(kind, (n) => n === 1 ? Promise.reject(new Error('token unavailable'))
      : Promise.resolve(n === 2 ? null : 'fresh'));
    t.after(() => h.client.stop());
    h.start();
    await flush();
    assert.equal(h.calls, 1);
    await h.tick(500);
    assert.equal(h.calls, 2);
    await h.tick(500);
    assert.equal(h.calls, 2);
    await h.tick(500);
    assert.equal(h.calls, 3);
    assert.equal(h.sockets.length, 1);
  });
}
