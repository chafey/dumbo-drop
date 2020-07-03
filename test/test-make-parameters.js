/* eslint-env mocha */
const assert = require('assert')

const makeParameters = require('../src/commands/pull-bucket/make-parameters')

describe('make-parameters', () => {

  it('exports function', async () => {
    assert(makeParameters)
  })

  it('returns object', async () => {
    const argv = {
      bucket: "test-bucket",
      prefix: undefined,
      concurrency: 1000,
      checkHead: false,
      force: false,
      local: false,
    }
    const parameters = makeParameters(argv)
    assert(parameters)
    assert.equal(parameters.bucket, 'test-bucket')
    assert.equal(parameters.prefix, undefined)
    assert.equal(parameters.concurrency, 1000)
    assert.equal(parameters.checkHead, false)
    assert.equal(parameters.force, false)
    assert.equal(parameters.local, false)
    assert.equal(parameters.internal.saveStateIntervalMS, 10000)
    assert.equal(parameters.internal.progressIntervalMS, 1000)
  })

})

