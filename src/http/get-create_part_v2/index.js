// learn more about HTTP functions here: https://arc.codes/primitives/http

const Block = require('@ipld/block')
const AWS = require('aws-sdk')
const awsConfig = require('aws-config')
const s3 = new AWS.S3(awsConfig())
const s3stream = require('s3-upload-stream')(s3)
const dumboDrop = require('dumbo-drop')

exports.handler = async (req) => {
  if (!req.query.Bucket || !req.query.blockBucket || !req.query.files) {
    throw new Error('Missing required arguments')
  }
  const { files } = req.query
  const parameters = {
    carFileBucket: req.query.Bucket,
  }
  const store = dumpDrop.store(Block, req.query.blockBucket)

  const result = await dumboDrop.createPart(files, parameters, store, s3stream)

  return {
    headers: { 'content-type': 'application/json; charset=utf8' },
    body: JSON.stringify(result)
  }
}
