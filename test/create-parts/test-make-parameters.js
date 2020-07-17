/* eslint-env mocha */
const assert = require('assert')

const makeParameters = require('../../src/commands/create-parts/make-parameters')

describe('create-parts', () => {
  describe('make-parameters', () => {
    it('exports function', async () => {
      assert(makeParameters)
    })

    it('success', async () => {
      const argv = {
        bucket: "test-bucket",
        concurrency: 1000,
        local: true,
      }
      process.env.DUMBO_BLOCK_BUCKET = 'test-bucket-block'
      process.env.DUMBO_CREATE_PART_LAMBDA = 'DumboDrop_CreatePart'

      const parameters = makeParameters(argv)
      assert(parameters)
      assert.equal(parameters.bucket, 'test-bucket')
      assert.equal(parameters.concurrency, 1000)
      assert.equal(parameters.local, true)
      assert.equal(parameters.blockBucket, "test-bucket-block")
      assert.equal(parameters.tableName, "dumbo-v2-test-bucket")
      assert.equal(parameters.createPartLambda, "DumboDrop_CreatePart")
    })
  })
})
