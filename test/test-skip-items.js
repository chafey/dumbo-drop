/* eslint-env mocha */

const assert = require('assert')
const skipItems = require('../src/commands/pull-bucket/skip-items')

describe('skip-items', () => {

  const makeMockDB = (items) => {
    return {
      items,
      getItems: async (keys) => {
        //return keys.map((key) =>
      },
      getItem: async (key) => {
        return items[key]
      }

    }
  }

  it('exports skipItem, skipItems', async () => {
    assert(skipItems.skipItem)
    assert(skipItems.skipItems)
  })

  /*
      it('skipItem succeeds', async () => {
          const db = makeMockDB()
          const urls = "http://foo.com"
          const checkHead = false
          const force = false
          const found = skipItems.skipItem(db, urls, checkHead, force)
          assert(found)
      })
  */
})
