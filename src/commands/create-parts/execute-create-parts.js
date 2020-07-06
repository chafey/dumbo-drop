const lambda = require('../../lambda')()
const get_create_part_v2 = require('../../http/get-create_part_v2');

const executeCreateParts = async (query, local) => {
  if (local) {
    const result = await get_create_part_v2.handler({
      query
    })
    const body = JSON.parse(result.body)
    return body
  } else {
    return lambda(process.env.DUMBO_CREATE_PART_LAMBDA, query)
  }
}

module.exports = executeCreateParts
