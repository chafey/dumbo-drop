const AWS = require('aws-sdk')

const getURL = (key, bucket, aws = AWS) => {
  if (bucket.includes('.')) {
    return `https://s3.amazonaws.com/${bucket}/${AWS.util.uriEscapePath(key)}`
  } else {
    const awsRegion = new aws.Config().region;
    return `https://${bucket}.s3.${awsRegion}.amazonaws.com/${AWS.util.uriEscapePath(key)}`
  }
}

module.exports = getURL
