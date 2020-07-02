const parseFile = require('./parse-file')
const prettyBytes = require('pretty-bytes')
const logUpdate = require('log-update')

let interval

const start = (appState) => {
  const sizes = []
  interval = setInterval(() => {
    const outs = { ...appState.display }
    sizes.push(outs.processed)
    if (sizes.length > 500000) sizes.shift()
    while (sizes.length && sizes[0] === 0) sizes.shift()
    outs.inflight = appState.inflight.length
    outs.skippedBytes = prettyBytes(outs.skippedBytes)
    outs.processed = prettyBytes(outs.processed)
    outs.pendingWrites = parseFile.debug.pending
    outs.writesFreed = parseFile.debug.free
    let persec
    if (sizes.length) {
      persec = (sizes[sizes.length - 1] - sizes[0]) / sizes.length
      outs.perf = prettyBytes(persec) + ' per second'
    }
    outs.oldest = appState.inflight[0]
    logUpdate(JSON.stringify(outs, null, 2))
  }, 1000)
}

const stop = () => {
  clearInterval(interval)
}

module.exports = {
  start,
  stop
}
