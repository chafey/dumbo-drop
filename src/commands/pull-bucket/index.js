const limits = require('../../limits')
const progress = require('./progress')
const stateFlusher = require('./state-flusher')
const processBucket = require('./process-bucket')
const stateFile = require('./state-file')
const applicationState = require('./application-state')

// main entrypoint for parsing a bucket
const run = async (parameters) => {
  console.log(limits)
  console.log(parameters)

  // Create default application state
  const appState = applicationState.getDefault()

  // check to see if there is prior processing state for this bucket
  // and if so - update the application state to resume processing and
  // and get the S3 filename to resume processing from
  let previousState = await stateFile.load(parameters.bucket)
  console.log('previousState = ', previousState)
  let startAfter = previousState ? applicationState.resumeFrom(previousState, appState) : undefined

  // setup a timer to periodically save our current processing state so we can resume
  // if something goes wrong
  stateFlusher.start(appState, parameters.bucket)

  // start out progress display
  progress.start(appState, parameters.bucket)

  // process the bucket..
  await processBucket(startAfter, appState, parameters)

  // done processing the bucket, stop our progress and state flusher
  progress.stop(appState, parameters.bucket)
  stateFlusher.stop()
}

module.exports = run
