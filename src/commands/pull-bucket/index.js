const limits = require('../../limits')
const progress = require('./progress')
const stateFlusher = require('./state-flusher')
const processBucket = require('./process-bucket')
const stateFile = require('./state-file')
const applicationState = require('./application-state')

// main entrypoint for parsing a bucket
const run = async (settings) => {
  console.log(limits)
  console.log(settings)

  // Create default processing state
  const appState = applicationState.getDefault()

  // check to see if there is prior processing state for this bucket
  // and if so - restore it and get the S3 filename to start processing from
  let previousState = await stateFile.load(settings.bucket)
  console.log('previousState = ', previousState)
  let startAfter = previousState ? applicationState.restore(previousState, appState) : undefined

  // setup a timer to periodically save our current processing state so we can resume
  // if something goes wrong
  stateFlusher.start(appState, settings.bucket, settings.internal.saveStateIntervalMS)

  // start out progress display
  progress.start(appState, settings)

  // process the bucket..
  await processBucket(startAfter, appState, settings)

  // done processing the bucket, stop our progress and state flusher
  progress.stop(appState, settings)
  stateFlusher.stop()
}

module.exports = run
