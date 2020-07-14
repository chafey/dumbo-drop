const prettyBytes = require('pretty-bytes')
const logUpdate = require('log-update')

const ONE_SECOND_IN_MS = 1000

const history = []

const print = (state) => {
  history.push(state.completedBytes)
  while (history.length > 600) {
    history.shift()
  }
  const outs = { ...state }
  outs.completedBytes = prettyBytes(outs.completedBytes)
  outs.skippedBytes = prettyBytes(outs.skippedBytes)
  outs.rate = prettyBytes((history[history.length - 1] - history[0]) / history.length) + ' per second'
  logUpdate(JSON.stringify(outs, null, 2))
}

const start = (state, progressIntervalMS = ONE_SECOND_IN_MS) => {
  print(state)

  interval = setInterval(() => {
    print(state)
  }, progressIntervalMS)
}

const stop = (state) => {
  if (interval) {
    clearInterval(interval)
  }
  print(state)
}

module.exports = {
  start,
  stop,
  print
}
