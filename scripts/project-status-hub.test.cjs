// Run: node --test scripts/project-status-hub.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

test('real hub open listeners catch initial/reconnect opens, ignore obsolete sockets and unsubscribe', async () => {
  let now = 1000, tick;
  const sockets = [];
  class Socket {
    static OPEN = 1;
    readyState = 0;
    constructor() { sockets.push(this); }
    close() { this.readyState = 3; }
    open() { this.readyState = 1; this.onopen?.(); }
  }
  const filename = path.join(__dirname, '../src/wss/ws-hub.ts');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports, WebSocket: Socket, URL, process: { env: {} },
    Date: { now: () => now },
    setInterval(fn) { tick = fn; return 1; }, clearInterval() {},
  });
  const hub = module.exports.wsHub;
  let opens = 0;
  const unsubscribeBroken = hub.subscribeOpen(() => { throw new Error('listener failure'); });
  const unsubscribe = hub.subscribeOpen(() => { assert.ok(hub.isOpen); opens++; });
  const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
  hub.start(async () => 'token');
  await flush();
  const staleOpen = sockets[0].onopen;
  sockets[0].open();
  assert.equal(opens, 1);
  tick(); tick();
  assert.equal(opens, 1, 'watchdog is not an open event');
  sockets[0].onerror();
  now += 500;
  tick(); await flush();
  staleOpen();
  assert.equal(opens, 1, 'obsolete socket must not announce open');
  sockets[1].open();
  assert.equal(opens, 2);
  unsubscribe(); unsubscribeBroken();
  hub.stop(); hub.start(async () => 'fresh-token');
  await flush();
  sockets[2].open();
  assert.equal(opens, 2);
  hub.stop();
});
