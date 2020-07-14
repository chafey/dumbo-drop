const lambda = require('../../lambda').raw

const request = lambda()

let mutex

const commp = async (db, key, state, parameters) => {
  const opts = { region: 'us-west-2', bucket: parameters.bucket, key }
  state.inflight += 1
  let commP
  try {
    commP = await request(parameters.commpLambda, opts)
  } catch (e) {
    state.fails += 1
    return null
  }
  state.inflight -= 1
  commP.root = key.slice(0, key.indexOf('/'))
  while (mutex) {
    await mutex
  }
  mutex = db.putItem(commP)
  await mutex
  mutex = null
  state.completed += 1
  state.completedBytes += commP.size
  return commP
}

module.exports = commp
