const limiter = require('../../limiter')
const getCarParts = require('./get-car-parts')
const progress = require('../create-parts/progress')
const executeCommP = require('./execute-commp')
const makeCommandState = require('./make-command-state')

const run = async (parameters) => {
  console.log(parameters)
  const state = makeCommandState()
  if (!parameters.silent) {
    progress.start(state)
  }
  const limit = limiter(parameters.concurrency)
  const db = require('../../queries')(parameters.tableName)
  for await (const { Key } of getCarParts(parameters.bucket)) {
    if (!Key.endsWith('.car')) continue
    const item = await db.getItem({ key: Key, bucket: parameters.bucket })
    if (!item || parameters.force) {
      await limit(executeCommP(db, Key, state, parameters))
    } else {
      state.skips += 1
      state.skippedBytes += item.size
    }
  }
  await limit.wait()
  progress.stop(state)
}

module.exports = run
