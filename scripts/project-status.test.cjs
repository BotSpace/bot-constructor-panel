// Run: node --test scripts/project-status.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
async function flush() { for (let i = 0; i < 20; i++) await Promise.resolve(); }
const stamp = '2026-09-16T10:00:00Z';
function project(id = 'a') {
  return {
    id, release_bot: false, flow: { nodes: [{ id: 'unsaved' }], edges: [] },
    release: { id: 'release', project_id: id, version: 4, status: 'pending', created_at: stamp, updated_at: stamp },
    debug: { id: 'debug', project_id: id, status: 'pending', created_at: stamp, updated_at: stamp },
  };
}

function setup() {
  const requests = [], effects = [], events = new Set(), opens = new Set();
  const session = { status: 'authenticated', data: { user: { id: 'user-1' } } };
  let open = false, starts = 0, flowLoads = 0;
  const hub = {
    get isOpen() { return open; },
    subscribe(fn) { events.add(fn); return () => events.delete(fn); },
    subscribeOpen(fn) { opens.add(fn); return () => opens.delete(fn); },
    start() {
      assert.ok(events.size && opens.size, 'listeners must precede start');
      starts++;
      this.open();
    },
    stop() { open = false; },
    open() { open = true; for (const fn of opens) fn(); },
    emit(event, data) { for (const fn of events) fn(event, data); },
  };
  const modules = new Map();
  function load(relative) {
    if (modules.has(relative)) return modules.get(relative);
    const filename = path.join(__dirname, '..', relative);
    const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    });
    const module = { exports: {} };
    const localRequire = (name) => {
      if (name === 'react') return { useEffect: (fn) => effects.push(fn), useRef: (value) => ({ current: value }) };
      if (name === 'react-hot-toast') return { __esModule: true, default: { error() {} } };
      if (name === '@/lib/session-client') return { useSession: () => session, getValidAccessToken: async () => 'token' };
      if (name === '@/wss/ws-hub') return { wsHub: hub };
      if (name === '@/services/instance') return { instanceAuth: { get(url, config) {
        const pending = deferred(); requests.push({ url, config, ...pending }); return pending.promise;
      } } };
      if (name === '@/features/bot-constructor/store') return { useFlowStore: { getState: () => ({ isDirty: true, loadFlow() { flowLoads++; } }) } };
      if (/debug-status|debug-errors|debug-context-store/.test(name)) return {};
      if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
      return require(name);
    };
    vm.runInNewContext(`(function(require, module, exports) {\n${outputText}\n})`, { AbortController, console }, { filename })(localRequire, module, module.exports);
    modules.set(relative, module.exports);
    return module.exports;
  }
  const store = load('src/features/bot-constructor/store/project.ts').default;
  const helper = load('src/wss/project-status.ts');
  store.setState({ project: project(), loading: false });
  function mount() {
    const { WebSocketProvider } = load('src/wss/web-socket-provider.tsx');
    WebSocketProvider({ children: null });
    return effects.pop()();
  }
  function resolveBatch(index, p) {
    requests[index].resolve({ data: p.release ? [p.release] : [] });
    requests[index + 1].resolve({ data: p.debug });
  }
  return { store, helper, hub, requests, mount, resolveBatch, session, get starts() { return starts; }, get flowLoads() { return flowLoads; } };
}

test('same-version pending/running/failed/stopped transitions preserve metadata and token semantics; old versions rejected', () => {
  const h = setup();
  const cleanup = h.mount();
  const flow = h.store.getState().project.flow;
  for (const status of ['running', 'failed', 'stopped']) {
    h.hub.emit('release_status', { project: 'a', version: 4, status, service_id: null });
    const p = h.store.getState().project;
    assert.equal(p.release.status, status);
    assert.equal(p.release.id, 'release');
    assert.equal(p.release.created_at, stamp);
    assert.equal(p.release_bot, false);
    assert.equal(p.flow, flow);
  }
  h.hub.emit('release_status', { project: 'a', version: 3, status: 'running' });
  assert.equal(h.store.getState().project.release.status, 'stopped');
  h.hub.emit('release_status', { project: 'a', version: 5, status: 'pending' });
  assert.equal(h.store.getState().project.release.version, 5);
  assert.equal(h.store.getState().project.release.id, '');
  assert.equal(h.store.getState().project.release.updated_at, '');
  cleanup();
});

test('available updated_at orders same-version release and debug events; missing timestamps remain accepted', () => {
  const h = setup(), cleanup = h.mount();
  for (const event of ['release_status', 'debug_status']) {
    const key = event === 'release_status' ? 'release' : 'debug';
    h.hub.emit(event, { project: 'a', version: 4, status: 'running', updated_at: '2026-09-16T10:02:00Z' });
    h.hub.emit(event, { project: 'a', version: 4, status: 'pending', updated_at: stamp });
    assert.equal(h.store.getState().project[key].status, 'running');
    h.hub.emit(event, { project: 'a', version: 4, status: 'stopped' });
    assert.equal(h.store.getState().project[key].status, 'stopped');
    h.hub.emit(event, { project: 'other', version: 9, status: 'running' });
    assert.equal(h.store.getState().project[key].status, 'stopped');
  }
  cleanup();
});

test('initial open and reconnect restore missed durable state without reloading the canvas; opens coalesce', async () => {
  const h = setup(), cleanup = h.mount();
  const flow = h.store.getState().project.flow;
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].url, '/relase');
  assert.equal(h.requests[1].url, '/projects/a/info');
  const first = project(); first.release.status = 'running'; first.debug.status = 'running';
  h.resolveBatch(0, first); await flush();
  assert.equal(h.store.getState().project.release.status, 'running');
  h.hub.open(); h.hub.open(); h.hub.open();
  assert.equal(h.requests.length, 4);
  const missed = project(); missed.release.status = 'stopped'; missed.debug.status = 'failed';
  h.resolveBatch(2, missed); await flush();
  assert.equal(h.requests.length, 6, 'only one trailing batch');
  h.resolveBatch(4, missed); await flush();
  assert.equal(h.store.getState().project.release.status, 'stopped');
  assert.equal(h.store.getState().project.debug.status, 'failed');
  assert.equal(h.store.getState().project.flow, flow);
  assert.equal(h.flowLoads, 0);
  assert.equal(h.requests.length, 6);
  cleanup();
});

test('late REST cannot overwrite newer live state, independently for each stream', async () => {
  const h = setup(), cleanup = h.mount();
  h.hub.emit('release_status', { project: 'a', version: 4, status: 'stopped' });
  const response = project(); response.release.status = 'running'; response.debug.status = 'running';
  h.resolveBatch(0, response); await flush();
  assert.equal(h.store.getState().project.release.status, 'stopped');
  assert.equal(h.store.getState().project.debug.status, 'running');
  h.hub.open();
  h.hub.emit('debug_status', { project: 'a', status: 'failed' });
  h.resolveBatch(2, response); await flush();
  assert.equal(h.store.getState().project.debug.status, 'failed');
  cleanup();
});

test('navigation including A/B/A aborts old scopes even when transports ignore abort', async () => {
  const h = setup(), cleanup = h.mount();
  h.store.getState().changeProject(project('b'));
  assert.ok(h.requests[0].config.signal.aborted);
  assert.equal(h.requests[3].url, '/projects/b/info');
  h.store.getState().changeProject(project('a'));
  const old = project(); old.release.status = 'failed'; old.debug.status = 'failed';
  h.resolveBatch(0, old); h.resolveBatch(2, project('b')); await flush();
  assert.equal(h.store.getState().project.release.status, 'pending');
  const current = project(); current.release.status = 'running';
  h.resolveBatch(4, current); await flush();
  assert.equal(h.store.getState().project.release.status, 'running');
  cleanup();
});

test('unmount/account replacement invalidates requests and removes listeners', async () => {
  const h = setup(), cleanup = h.mount();
  cleanup();
  assert.ok(h.requests[0].config.signal.aborted);
  h.session.data.user.id = 'user-2';
  const cleanup2 = h.mount();
  const stale = project(); stale.release.status = 'failed';
  h.resolveBatch(0, stale); await flush();
  assert.equal(h.store.getState().project.release.status, 'pending');
  h.resolveBatch(2, project()); await flush();
  cleanup2();
  h.hub.open(); h.hub.emit('release_status', { project: 'a', version: 4, status: 'failed' });
  assert.equal(h.store.getState().project.release.status, 'pending');
  assert.equal(h.requests.length, 4);
});

test('project becoming available after initial open triggers catch-up; loading invalidates previous requests', async () => {
  const h = setup();
  h.store.setState({ loading: true, project: null });
  const cleanup = h.mount();
  assert.equal(h.requests.length, 0);
  h.store.setState({ loading: false, project: project() });
  assert.equal(h.requests.length, 2);
  h.store.setState({ loading: true });
  assert.ok(h.requests[0].config.signal.aborted);
  h.resolveBatch(0, project()); await flush();
  h.store.setState({ loading: false, project: project('b') });
  assert.equal(h.requests.length, 4);
  cleanup();
});

test('partial REST failure keeps known status, no timer/retry storm, next reconnect recovers', async () => {
  const h = setup(), cleanup = h.mount();
  h.requests[0].reject(new Error('offline'));
  const debug = { ...project().debug, status: 'running' };
  h.requests[1].resolve({ data: debug }); await flush();
  assert.equal(h.store.getState().project.debug.status, 'running');
  assert.equal(h.store.getState().project.release.status, 'pending');
  assert.equal(h.requests.length, 2);
  h.hub.open();
  const next = project(); next.release = null;
  h.resolveBatch(2, next); await flush();
  assert.equal(h.store.getState().project.release, null);
  cleanup();
});

test('overlapping project loads and lifecycle cancellation cannot publish stale project responses', async () => {
  const h = setup();
  function resolveLoad(index, id) {
    h.requests[index].resolve({ data: { ...project(id), debug_webhook_uuid: 'uuid' } });
    h.requests[index + 1].resolve({ data: [project(id).release] });
    h.requests[index + 2].resolve({ data: project(id).debug });
    h.requests[index + 3].resolve({ data: [] });
  }
  h.store.getState().loadProject('old');
  h.store.getState().loadProject('new');
  resolveLoad(4, 'new'); await flush();
  resolveLoad(0, 'old'); await flush();
  assert.equal(h.store.getState().project.id, 'new');
  h.store.getState().loadProject('cancelled');
  h.store.getState().cancelProjectLoad();
  resolveLoad(8, 'cancelled'); await flush();
  assert.equal(h.store.getState().project.id, 'new');
  assert.equal(h.store.getState().loading, false);
});
