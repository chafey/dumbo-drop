const AWS = require('aws-sdk')
const awsConfig = require('aws-config')

const getCarParts = async function* (bucket, s3 = new AWS.S3({ ...awsConfig(), correctCloseSkew: true })) {
  const opts = { Bucket: bucket }
  let data
  do {
    data = await s3.listObjectsV2(opts).promise()
    yield* data.Contents
    if (!data.Contents.length) {
      return
    }
    opts.StartAfter = data.Contents[data.Contents.length - 1].Key
  } while (data.Contents.length)
}

module.exports = getCarParts
