const AWS = require('aws-sdk')

const awsRegion = new AWS.Config().region;

const getURL = fileInfo => {
  if (fileInfo.Bucket.includes('.')) {
    return `https://s3.amazonaws.com/${fileInfo.Bucket}/${AWS.util.uriEscapePath(fileInfo.Key)}`
  } else {
    return `https://${fileInfo.Bucket}.s3.${awsRegion}.amazonaws.com/${AWS.util.uriEscapePath(fileInfo.Key)}`
  }
}

module.exports = getURL
