/* eslint-env mocha */
const assert = require('assert')

const makeParameters = require('../../src/commands/pull-bucket/make-parameters')

describe('pull-bucket', () => {
  describe('make-parameters', () => {

    it('exports function', async () => {
      assert(makeParameters)
    })

    it('success', async () => {
      const argv = {
        bucket: "test-bucket",
        prefix: undefined,
        concurrency: 1000,
        checkHead: false,
        force: false,
        local: false,
      }
      process.env.DUMBO_BLOCK_BUCKET = 'test-bucket-block'
      process.env.DUMBO_PARSE_FILE_LAMBDA = 'DumboDrop_GetParseFile'

      const parameters = makeParameters(argv)

      assert(parameters)
      assert.equal(parameters.bucket, 'test-bucket')
      assert.equal(parameters.prefix, undefined)
      assert.equal(parameters.concurrency, 1000)
      assert.equal(parameters.checkHead, false)
      assert.equal(parameters.force, false)
      assert.equal(parameters.local, false)
      assert.equal(parameters.blockBucket, "test-bucket-block")
      assert.equal(parameters.tableName, "dumbo-v2-test-bucket")
      assert.equal(parameters.parseFileLambda, "DumboDrop_GetParseFile")
    })
  })
})

