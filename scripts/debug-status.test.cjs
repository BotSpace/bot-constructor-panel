// Run: node --test scripts/debug-status.test.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');

const EPOCH = 1_800_000_000_000;
function setup() {
  let now = EPOCH;
  let nextTimer = 0;
  const timers = new Map();
  const filename = path.join(__dirname, '../src/features/bot-constructor/store/debug-status.ts');
  const { outputText } = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const context = vm.createContext({
    Date: { now: () => now },
    setTimeout(fn, delay) {
      const id = ++nextTimer;
      timers.set(id, { fn, due: now + delay });
      return id;
    },
    clearTimeout(id) { timers.delete(id); },
  });
  const module = { exports: {} };
  // Use the installed Zustand implementation, not a mock of its state semantics.
  vm.runInContext(`(function(require, module, exports) {\n${outputText}\n})`, context, { filename })(require, module, module.exports);
  const store = module.exports.useDebugStatusStore;
  return {
    state: store.getState,
    send({ node = 'n', status = 'running', time = EPOCH, run = 1, seq = 1, execution, attempt, error } = {}) {
      store.getState().setNodeStatus(node, status, time === null ? undefined : time, error, run, seq, execution, attempt);
    },
    advance(ms) {
      now += ms;
      for (const [id, timer] of timers) {
        if (timer.due <= now) { timers.delete(id); timer.fn(); }
      }
    },
    timers,
  };
}

test('fresh legacy -> UUID execution may reset run 100 to run 1', () => {
  const h = setup();
  h.send({ run: 100, status: 'success' });
  h.send({ execution: 'new', time: EPOCH + 1000 });
  assert.equal(h.state().currentRunId, 1);
  assert.equal(h.state().currentExecutionId, 'new');
  assert.equal(h.state().statuses.n, 'running');
});

test('seconds and milliseconds normalize in both directions', () => {
  for (const secondsFirst of [false, true]) {
    const h = setup();
    h.send({ execution: 'a', run: 100, time: secondsFirst ? EPOCH / 1000 : EPOCH });
    assert.equal(h.state().timestamps.n, EPOCH);
    h.send({ execution: 'b', time: secondsFirst ? EPOCH + 1000 : EPOCH / 1000 + 1 });
    assert.equal(h.state().currentExecutionId, 'b');
    assert.equal(h.state().timestamps.n, EPOCH + 1000);
  }
});

test('fallback is milliseconds but never evidence for switching executions', () => {
  const h = setup();
  h.send({ execution: 'a', run: 100, time: null });
  assert.equal(h.state().timestamps.n, EPOCH);
  const before = h.state();
  h.advance(1000);
  for (const time of [null, NaN, Infinity, 0, -1]) {
    h.send({ execution: 'b', time });
    assert.equal(h.state(), before);
  }
  h.send({ execution: 'b', time: EPOCH / 1000 + 1 });
  assert.equal(h.state().currentExecutionId, 'b');
});

test('explicit older timestamps reject a different execution even with a higher run', () => {
  const h = setup();
  h.send({ execution: 'a', time: EPOCH / 1000, status: 'success' });
  const before = h.state();
  for (const time of [EPOCH - 1, EPOCH / 1000 - 1]) {
    h.send({ execution: 'b', run: 200, time });
    assert.equal(h.state(), before);
  }
});

test('higher run accepts a new UUID in the same second; retired UUID cannot return', () => {
  const h = setup();
  h.send({ execution: 'a', run: 1, time: EPOCH / 1000, status: 'success' });
  h.send({ execution: 'b', run: 2, time: EPOCH / 1000 });
  assert.equal(h.state().currentRunId, 2);
  assert.equal(h.state().currentExecutionId, 'b');
  assert.equal(h.state().statuses.n, 'running');
  const before = h.state();
  for (const time of [EPOCH / 1000, EPOCH / 1000 + 1]) {
    h.send({ execution: 'a', run: 3, time });
    assert.equal(h.state(), before);
  }
});

test('unseen UUID with lower or same run is rejected at equal occurrence time', () => {
  const h = setup();
  h.send({ execution: 'a', run: 100, time: EPOCH / 1000, status: 'success' });
  const before = h.state();
  for (const run of [1, 100]) {
    for (const time of [EPOCH / 1000, EPOCH]) {
      h.send({ execution: `unseen-${run}`, run, time });
      assert.equal(h.state(), before);
    }
  }
  h.send({ execution: 'fresh-reset', run: 1, time: EPOCH / 1000 + 1 });
  assert.equal(h.state().currentExecutionId, 'fresh-reset');
  assert.equal(h.state().currentRunId, 1);
});

test('retired execution cannot bounce back with newer timestamps or run IDs', () => {
  const h = setup();
  h.send({ execution: 'a', run: 100 });
  h.send({ execution: 'b', time: EPOCH + 1000 });
  const before = h.state();
  h.send({ execution: 'a', run: 101, time: EPOCH + 2000 });
  assert.equal(h.state(), before);
  h.send({ execution: 'c', time: EPOCH + 3000 });
  assert.equal(h.state().currentExecutionId, 'c');
  for (let i = 0; i < 100; i++) h.send({ execution: `next-${i}`, time: EPOCH + 4000 + i * 1000 });
  assert.equal(h.state().retiredExecutionIds.length, 64);
});

test('rejected traffic does not rearm auto-clear', () => {
  const h = setup();
  h.send({ execution: 'a', run: 100, seq: 10, status: 'success', attempt: 2 });
  const before = h.state();
  const timerId = [...h.timers.keys()][0];
  for (let i = 0; i < 5; i++) {
    h.advance(10000);
    h.send({ execution: 'a', run: 99 });
    h.send({ execution: 'b', time: EPOCH });
    h.send({ execution: 'a', run: 100, status: 'success', seq: 10, attempt: 2 });
    h.send({ execution: 'a', run: 100, seq: 11, attempt: 2 });
    h.send({ execution: 'a', run: 100, status: 'error', seq: 12, attempt: 1 });
    h.send({ run: 0 });
    assert.equal(h.state(), before);
    assert.deepEqual([...h.timers.keys()], [timerId]);
  }
  h.advance(10000);
  assert.equal(Object.keys(h.state().statuses).length, 0);
  assert.equal(h.state().currentRunId, null);
  assert.equal(h.timers.size, 0);
  h.send({ execution: 'b', time: EPOCH / 1000 + 60 });
  assert.equal(h.state().currentExecutionId, 'b');
});

test('accepted activity rearms auto-clear and explicit clear cancels it', () => {
  const h = setup();
  h.send();
  h.advance(50000);
  h.send({ seq: 2, status: 'success' });
  h.advance(10000);
  assert.equal(h.state().statuses.n, 'success');
  h.advance(50000);
  assert.equal(Object.keys(h.state().statuses).length, 0);
  h.send();
  h.state().clearStatuses();
  assert.equal(h.timers.size, 0);
  assert.equal(h.state().retiredExecutionIds.length, 0);
});

test('attempt 2 running replaces attempt 1 terminal and clears its error', () => {
  const h = setup();
  h.send({ execution: 'a', attempt: 1, status: 'error', error: 'failed', seq: 100 });
  h.send({ execution: 'a', attempt: 2, seq: 1 });
  assert.equal(h.state().statuses.n, 'running');
  assert.equal(h.state().attempts.n, 2);
  assert.equal(h.state().seqs.n, 1);
  assert.equal(h.state().errors.n, undefined);
  const before = h.state();
  for (const attempt of [1, undefined]) {
    h.send({ execution: 'a', attempt, status: 'error', error: 'stale', seq: 200 });
    assert.equal(h.state(), before);
  }
  h.send({ execution: 'a', attempt: 2, status: 'success', seq: 2 });
  h.send({ execution: 'a', attempt: 2, seq: 3 });
  assert.equal(h.state().statuses.n, 'success');
});

test('new attempt without sequence discards the previous attempt sequence', () => {
  const h = setup();
  h.send({ attempt: 1, status: 'success', seq: 100 });
  h.state().setNodeStatus('n', 'running', EPOCH, undefined, 1, undefined, undefined, 2);
  assert.equal(h.state().seqs.n, undefined);
  h.send({ attempt: 2, seq: 1 });
  assert.equal(h.state().seqs.n, 1);
});

test('same-attempt terminal exception remains; timestamp high-water never regresses', () => {
  const h = setup();
  h.send({ execution: 'a', attempt: 1, status: 'waiting', seq: 10, time: EPOCH + 2000 });
  h.send({ execution: 'a', attempt: 1, status: 'success', seq: 9, time: EPOCH / 1000 });
  assert.equal(h.state().statuses.n, 'success');
  assert.equal(h.state().timestamps.n, EPOCH + 2000);
  const before = h.state();
  h.send({ execution: 'b', time: EPOCH + 1000 });
  assert.equal(h.state(), before);
});

test('same execution cannot reset run counter; higher legacy runs still reset', () => {
  const h = setup();
  h.send({ execution: 'a', run: 100, status: 'success' });
  const before = h.state();
  h.send({ execution: 'a', run: 1, time: EPOCH + 1000 });
  assert.equal(h.state(), before);
  const legacy = setup();
  legacy.send({ run: 100, status: 'success', attempt: 2 });
  legacy.send({ node: 'next', run: 101 });
  assert.equal(legacy.state().statuses.n, undefined);
  assert.equal(legacy.state().statuses.next, 'running');
});
