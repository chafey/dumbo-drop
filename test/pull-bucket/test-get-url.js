/* eslint-env mocha */
const assert = require('assert')

const getUrl = require('../../src/commands/pull-bucket/get-url')

describe('pull-bucket', () => {
  describe('get-url', () => {

    it('exports function', async () => {
      assert(getUrl)
    })

    it('returns special url for bucket with dot in name', async () => {
      const url = getUrl('key', 'bucket.withdot')
      assert.equal(url, 'https://s3.amazonaws.com/bucket.withdot/key')
    })

    it('returns url with region', async () => {
      const mockAWS = {
        Config: function Config() { return this.region = 'us-west-2' }
      }
      const url = getUrl('key', 'normal-bucket-name', mockAWS)
      assert.equal(url, 'https://normal-bucket-name.s3.us-west-2.amazonaws.com/key')
    })
  })
})

