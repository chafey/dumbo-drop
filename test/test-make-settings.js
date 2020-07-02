/* eslint-env mocha */
const assert = require('assert')

const makeSettings = require('../src/commands/pull-bucket/make-settings')

describe('make-settings', () => {

  it('exports function', async () => {
    assert(makeSettings)
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
    const settings = makeSettings(argv)
    assert(settings)
    assert.equal(settings.bucket, 'test-bucket')
    assert.equal(settings.prefix, undefined)
    assert.equal(settings.concurrency, 1000)
    assert.equal(settings.checkHead, false)
    assert.equal(settings.force, false)
    assert.equal(settings.local, false)
    assert.equal(settings.internal.saveStateIntervalMS, 10000)
    assert.equal(settings.internal.progressIntervalMS, 1000)
  })

})

