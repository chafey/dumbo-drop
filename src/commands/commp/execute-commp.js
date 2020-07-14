const lambda = require('../../lambda').raw

const request = lambda()

let mutex

const commp = async (db, key, output, parameters) => {
  const opts = { region: 'us-west-2', bucket: parameters.bucket, key }
  output.inflight += 1
  let commP
  try {
    commP = await request(parameters.commpLambda, opts)
  } catch (e) {
    output.fails += 1
    return null
  }
  output.inflight -= 1
  commP.root = key.slice(0, key.indexOf('/'))
  while (mutex) {
    await mutex
  }
  mutex = db.putItem(commP)
  await mutex
  mutex = null
  output.completed += 1
  output.completedBytes += commP.size
  return commP
}

module.exports = commp
