const AWS = require('aws-sdk')
const awsConfig = require('aws-config')

const s3 = new AWS.S3(awsConfig())

const encodeKey = cid => {
  const key = cid.toString('base32')
  const full = `${key}/encode`
  return full
}
// IPLD block store for S3
module.exports = (Block, Bucket, ACL = 'public-read', S3 = s3) => {
  // Stores a block in the block store.  Returns resolved promise
  // on success, rejected on failure
  const put = async block => {
    const params = {
      ACL,
      Bucket,
      Body: block.encode(),
      Key: await block.cid().then(cid => encodeKey(cid))
    }
    return S3.putObject(params).promise()
  }
  // Retrieves the block for cid from the block store.  Returns the
  // block on success or rejected promise on failure
  const get = async cid => {
    const params = { Bucket, Key: encodeKey(cid) }
    const data = await S3.getObject(params).promise()
    return Block.create(data, cid)
  }
  return { put, get }
}
