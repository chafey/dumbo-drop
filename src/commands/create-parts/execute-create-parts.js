const lambda = require('../../lambda')()
const createPart = require('../../create-part')
const createStore = require('../../store')
const Block = require('@ipld/block')
const AWS = require('aws-sdk')
const awsConfig = require('aws-config')
const s3 = new AWS.S3(awsConfig())
const s3stream = require('s3-upload-stream')(s3)

const executeCreateParts = async (query, local, parameters) => {
  if (local) {
    const files = query.files
    const store = createStore(Block, parameters.blockBucket)
    const result = await createPart(files, parameters, store, s3stream)
    return result
  } else {
    return lambda(process.env.DUMBO_CREATE_PART_LAMBDA, query)
  }
}

module.exports = executeCreateParts
