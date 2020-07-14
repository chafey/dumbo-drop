/* eslint-env mocha */

const assert = require('assert')
const putItem = require('../../src/commands/pull-bucket/serialized-put-item')

describe('pull-bucket', () => {
  describe('serialized-put-item', () => {

    const makeMockDB = () => {
      const items = []
      return {
        items,
        putItem: async (item) => {
          items.push(item)
        }
      }
    }

    it('exports function', async () => {
      assert(putItem)
    })

    it('putItem succeeds', async () => {
      const db = makeMockDB()
      await putItem(db, { Foo: "Bar" })
    })

    it('putItem serializes', async () => {
      const items = []
      const resolves = []
      const db = {
        resolves,
        items,
        putItem: async (item) => {
          items.push(item)
          return new Promise(resolve => { resolves.push(resolve) })
        }
      }
      const first = putItem(db, { ItemNumber: 1 })
      const second = putItem(db, { ItemNumber: 2 })
      assert(items.length === 1)
      resolves[0]()
      await first
      assert(items.length === 2)
      resolves[1]()
      await second
    })

    it('putItem fails', async () => {
      const db = makeMockDB()
      db.putItem = async (item) => { return Promise.reject(new Error("simulated failure")) }
      putItem(db, { Foo: "Bar" })
        .then(() => {
          assert(0 && "should not resolve")
        })
        .catch((err) => {
          assert(err)
          assert(err.message === "simulated failure")
          assert(err.name === "Error")
        })
    })

    it('putItem succeeds after failure', async () => {
      const db = makeMockDB()
      db.putItem = async (item) => { return Promise.reject(new Error("simulated failure")) }
      putItem(db, { ItemNumber: 1 })
        .then(async () => {
          assert(0 && "should not resolve")
        })
        .catch(async (err) => {
          assert(err)
          assert(err.message === "simulated failure")
          assert(err.name === "Error")
          db.putItem = async (item) => { return Promise.resolve() }
          await putItem(db, { ItemNumber: 2 })
        })
    })
  })
})
