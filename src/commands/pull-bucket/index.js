const limits = require('../../limits')
const progress = require('./progress')
const stateFlusher = require('./state-flusher')
const processBucket = require('./process-bucket')
const stateFile = require('./state-file')

const getDefaultAppState = () => {
  return {
    // the most recent S3 url we are parseing.  This is written out to the state
    // file so we can continue from this point in case the app crashes
    latest: undefined,

    // list of S3 URLs currently being parsed/chunked.
    inflight: [],

    // display contains various statistics we display to the user while  processing
    display: {
      skipped: 0, // number of files skipped
      skippedBytes: 0, // number of bytes skipped (from skipped files)
      complete: 0, // number of files processed
      processed: 0 // number of bytes processed (from files processed)
    }
  }
}

const restoreAppState = (previousState, appState, state) => {
  console.log('prior state found, restoring')
  // if we have a state file from a previous run of this bucket, initialize our
  // internal state with it.  if not, initialize state for fresh run
  appState.display.skippedBytes = previousState.completed
  if (previousState.startAfter) {
    const startAfter = previousState.startAfter.slice(0, previousState.startAfter.length - 2)
    return startAfter
  }
}

// main entrypoint for parsing a bucket
const run = async (settings) => {
  console.log(limits)
  console.log(settings)

  // Create default application state
  const appState = getDefaultAppState()

  // check to see if there is prior processing state for this bucket
  // and if so - restore it and get the S3 filename to start processing
  // from
  let previousState = await stateFile.load(settings)
  console.log('previousState = ', previousState)
  let startAfter
  if (previousState) {
    startAfter = restoreAppState(previousState, appState, settings)
  }

  // setup a timer to periodically save our current processing state so we can resume
  // if something goes wrong
  await stateFlusher.start(appState, settings)

  // start out progress display
  progress.start(appState, settings)

  // process the bucket..
  await processBucket(startAfter, appState, settings)

  // done processing the bucket, stop our progress and state flusher
  progress.stop(appState, settings)
  stateFlusher.stop()
}

module.exports = run
