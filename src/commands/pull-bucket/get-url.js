const AWS = require('aws-sdk')

const awsRegion = new AWS.Config().region;

const getURL = (key, bucket) => {
  if (bucket.includes('.')) {
    return `https://s3.amazonaws.com/${bucket}/${AWS.util.uriEscapePath(key)}`
  } else {
    return `https://${bucket}.s3.${awsRegion}.amazonaws.com/${AWS.util.uriEscapePath(key)}`
  }
}

module.exports = getURL
