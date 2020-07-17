const limiter = require('../../limiter')
const getCarParts = require('./get-car-parts')
const progress = require('../create-parts/progress')
const executeCommP = require('./execute-commp')
const makeCommandState = require('./make-command-state')

// main entrypoint for commp command
const run = async (parameters) => {
  console.log(parameters)

  // create initial state
  const state = makeCommandState()

  // start our progress display if not running with silent parameter
  if (!parameters.silent) {
    progress.start(state)
  }

  // iterate over each car file
  const limit = limiter(parameters.concurrency)
  const db = require('../../queries')(parameters.tableName)
  for await (const { Key } of getCarParts(parameters.bucket)) {

    // skip any file that is not a CAR file
    if (!Key.endsWith('.car')) {
      continue
    }

    // see if there is a commp already calculated for this car file
    const item = await db.getItem({ key: Key, bucket: parameters.bucket })

    // generate a commp if there is no item or we are running with the force parameter
    if (!item || parameters.force) {
      await limit(executeCommP(db, Key, state, parameters))
    } else {
      state.skips += 1
      state.skippedBytes += item.size
    }
  }
  // wait for all pending operations to complete
  await limit.wait()

  // stop the progress display
  progress.stop(state)
}

module.exports = run
