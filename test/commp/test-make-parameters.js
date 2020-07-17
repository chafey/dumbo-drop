/* eslint-env mocha */
const assert = require('assert')

const makeParameters = require('../../src/commands/commp/make-parameters')

describe('commp', () => {
  describe('make-parameters', () => {
    it('exports function', async () => {
      assert(makeParameters)
    })

    it('success', async () => {
      const argv = {
        bucket: "test-bucket",
        concurrency: 1000,
        force: true,
        silent: true,
      }
      const parameters = makeParameters(argv)
      assert(parameters)
      assert.equal(parameters.bucket, 'test-bucket')
      assert.equal(parameters.concurrency, 1000)
      assert.equal(parameters.force, true)
      assert.equal(parameters.silent, true)
    })

  })
})
