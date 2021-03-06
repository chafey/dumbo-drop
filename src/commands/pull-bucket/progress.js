const parseFile = require('./parse-file')
const prettyBytes = require('pretty-bytes')
const logUpdate = require('log-update')

let interval

const sizes = []

const ONE_SECOND_IN_MS = 1000

const print = (appState, bucket) => {
  const outs = { ...appState.display }
  outs.Bucket = bucket
  sizes.push(outs.processedBytes)
  if (sizes.length > 500000) sizes.shift()
  while (sizes.length && sizes[0] === 0) sizes.shift()
  outs.inflight = appState.inflight.length
  outs.skippedBytes = prettyBytes(outs.skippedBytes)
  outs.processedBytes = prettyBytes(outs.processedBytes)
  outs.pendingWrites = parseFile.debug.pending
  outs.writesFreed = parseFile.debug.free
  let persec
  if (sizes.length) {
    persec = (sizes[sizes.length - 1] - sizes[0]) / sizes.length
    outs.perf = prettyBytes(persec) + ' per second'
  }
  outs.oldest = appState.inflight[0]
  logUpdate(JSON.stringify(outs, null, 2))
}

const start = (appState, bucket, progressIntervalMS = ONE_SECOND_IN_MS) => {
  print(appState, bucket)

  interval = setInterval(() => {
    print(appState, bucket)
  }, progressIntervalMS)
}

const stop = (appState, bucket) => {
  clearInterval(interval)
  print(appState, bucket)
}

module.exports = {
  start,
  stop,
  print
}
