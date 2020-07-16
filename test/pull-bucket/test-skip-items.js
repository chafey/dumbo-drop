/* eslint-env mocha */

const assert = require('assert')
const skipItems = require('../../src/commands/pull-bucket/skip-items')

describe('pull-bucket', () => {
  describe('skip-items', () => {

    const mockHead403 = async (url) => { return { statusCode: 403 } }
    const mockHead400 = async (url) => { return { statusCode: 400 } }
    const mockHeadFailing = async (url) => Promise.reject(new StatusError({ statusCode: 401 }))


    const makeMockDB = (items) => {
      return {
        items,
        getItems: async (keys) => {
          return items
        },
        getItem: async (key) => {
          return items[key]
        }
      }
    }

    it('exports skipItem, skipItems', async () => {
      assert(skipItems)
    })


    it('skipItems succeeds', async () => {
      const db = makeMockDB({ "https://foo.com": {}, "https://bar.com": {} })
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = false
      const force = false
      const found = await skipItems(db, urls, checkHead, force)
      assert.equal([...found].length, 2)
    })

    it('skipItems with checkHead true succeeds', async () => {
      const db = makeMockDB({})
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = true
      const force = false
      const found = await skipItems(db, urls, checkHead, force, mockHead403)
      assert.equal([...found].length, 2)
    })

    it('skipItems omits missing items', async () => {
      const db = makeMockDB({ "https://foo.com": {} })
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = false
      const force = false
      const found = await skipItems(db, urls, checkHead, force, mockHead403)
      assert.equal([...found].length, 1)
    })

    it('skipItems force returns no items', async () => {
      const db = makeMockDB({ "https://foo.com": {}, "https://bar.com": {} })
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = false
      const force = true
      const found = await skipItems(db, urls, checkHead, force, mockHead403)
      assert.equal([...found].length, 0)
    })

    it('skipItems force and checkHead returns all items', async () => {
      const db = makeMockDB({})
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = true
      const force = false
      const found = await skipItems(db, urls, checkHead, force, mockHead403)
      assert.equal([...found].length, 2)
    })

    it('skipItems force and checkHead with 400 returns no items', async () => {
      const db = makeMockDB({})
      const urls = ["https://foo.com", "https://bar.com"]
      const checkHead = true
      const force = false
      const found = await skipItems(db, urls, checkHead, force, mockHead400)
      assert.equal([...found].length, 0)
    })
  })
})
