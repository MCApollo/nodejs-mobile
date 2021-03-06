'use strict';

const common = require('../common.js');

if (process.versions.hasOwnProperty('chakracore')) {
  // tracing events are not supported in node-chakracore
  // however, the benchmark harness fails if it runs a file without a benchmark
  // set up instead of disabling the entire misc benchmark, we can simply shim
  // this benchmark
  const bench = common.createBenchmark(function main({ n }) {
    bench.start();
    while (--n > 0) {
      --n;
    }
    bench.end(n);
  }, {
    n: [100000]
  });
  return;
}

const bench = common.createBenchmark(main, {
  n: [100000],
  method: ['trace', 'emit', 'isTraceCategoryEnabled', 'categoryGroupEnabled']
}, {
  flags: ['--expose-internals', '--trace-event-categories', 'foo']
});

const {
  trace,
  isTraceCategoryEnabled,
  emit,
  categoryGroupEnabled
} = process.binding('trace_events');

const {
  TRACE_EVENT_PHASE_NESTABLE_ASYNC_BEGIN: kBeforeEvent
} = process.binding('constants').trace;

function doEmit(n) {
  bench.start();
  for (var i = 0; i < n; i++) {
    emit(kBeforeEvent, 'foo', 'test', 0, 'arg1', 1);
  }
  bench.end(n);
}

function doTrace(n) {
  bench.start();
  for (var i = 0; i < n; i++) {
    trace(kBeforeEvent, 'foo', 'test', 0, 'test');
  }
  bench.end(n);
}

function doIsTraceCategoryEnabled(n) {
  bench.start();
  for (var i = 0; i < n; i++) {
    isTraceCategoryEnabled('foo');
    isTraceCategoryEnabled('bar');
  }
  bench.end(n);
}

function doCategoryGroupEnabled(n) {
  bench.start();
  for (var i = 0; i < n; i++) {
    categoryGroupEnabled('foo');
    categoryGroupEnabled('bar');
  }
  bench.end(n);
}

function main({ n, method }) {
  switch (method) {
    case '':
    case 'trace':
      doTrace(n);
      break;
    case 'emit':
      doEmit(n);
      break;
    case 'isTraceCategoryEnabled':
      doIsTraceCategoryEnabled(n);
      break;
    case 'categoryGroupEnabled':
      doCategoryGroupEnabled(n);
      break;
    default:
      throw new Error(`Unexpected method "${method}"`);
  }
}
