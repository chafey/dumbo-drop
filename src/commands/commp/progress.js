const prettyBytes = require('pretty-bytes')
const logUpdate = require('log-update')

const ONE_SECOND_IN_MS = 1000

const history = []

const print = (output) => {
  history.push(output.completedBytes)
  while (history.length > 600) {
    history.shift()
  }
  const outs = { ...output }
  outs.completedBytes = prettyBytes(outs.completedBytes)
  outs.skippedBytes = prettyBytes(outs.skippedBytes)
  outs.rate = prettyBytes((history[history.length - 1] - history[0]) / history.length) + ' per second'
  logUpdate(JSON.stringify(outs, null, 2))
}

const start = (output, progressIntervalMS = ONE_SECOND_IN_MS) => {
  print(output)

  interval = setInterval(() => {
    print(output)
  }, progressIntervalMS)
}

const stop = (output) => {
  if (interval) {
    clearInterval(interval)
  }
  print(output)
}

module.exports = {
  start,
  stop,
  print
}
