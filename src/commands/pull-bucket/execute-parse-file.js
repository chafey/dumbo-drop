const lambda = require('../../lambda')()
const get_parse_file_v2 = require('../../http/get-parse_file_v2');

const executeParseFile = async (opts, local) => {
    if (local) {
        const result = await get_parse_file_v2.handler({
          query: opts
        })
        const body = JSON.parse(result.body)
        return body
    } else {
      return lambda(process.env.DUMBO_PARSE_FILE_LAMBDA, opts)
    }
}

module.exports = executeParseFile