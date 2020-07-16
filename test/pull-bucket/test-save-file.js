/* eslint-env mocha */

const assert = require('assert')
const saveFile = require('../../src/commands/pull-bucket/save-file')
const limits = require('../../src/limits')
describe('pull-bucket', () => {

  describe('save-file', () => {

    const makeMockDB = () => {
      const items = []
      return {
        items,
        putItem: async (item) => {
          items.push(item)
          return [{ UnprocessedItems: {} }]
        }
      }
    }

    it('exports saveFile, saveSplits and debug', async () => {
      assert(saveFile.saveFile)
      assert(saveFile.saveSplits)
      assert(saveFile.debug)
    })

    it('saveFile succeeds', async () => {
      const db = makeMockDB()
      const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
      const dataset = "chafey-dumbo-drop-test"
      const parts = ['mAVUSIBIfd3Bfjibu+qyv4Ne+zI3ULJtVU+PcuQQoPZqWyfFq']
      const size = 180916
      let result = await saveFile.saveFile(db, url, dataset, parts, size)
      assert(db.items.length === 1)
      assert(db.items[0].url === 'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR')
      assert(db.items[0].size === 180916)
      assert(db.items[0].dataset === 'chafey-dumbo-drop-test')
      assert(db.items[0].parts.length === 1)
      assert(result.length === 1)
      assert(result[0].UnprocessedItems)
      assert(Object.keys(result[0].UnprocessedItems).length === 0)
    })

    it('saveFile fails', async () => {
      const db = makeMockDB()
      db.putItem = async (item) => { return Promise.reject(new Error("simulated failure")) }
      const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
      const dataset = "chafey-dumbo-drop-test"
      const parts = ['mAVUSIBIfd3Bfjibu+qyv4Ne+zI3ULJtVU+PcuQQoPZqWyfFq']
      const size = 180916
      saveFile.saveFile(db, url, dataset, parts, size)
        .then(() => assert(0 && "should not happen"))
        .catch((err) => {
          assert(err)
          assert(err.message === "simulated failure")
          assert(err.name === "Error")
        })
    })

    it('saveSplits succeeds', async () => {
      const testLimits = {
        MAX_CAR_FILE_SIZE: 1024 * 1024 * 4
      }
      const db = makeMockDB()
      const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR"
      const dataset = "chafey-dumbo-drop-test"
      const size = 12233370
      const splits = [
        [
          'mAVUSIOCS5sGDcqo+KTdHYzOxhw8DPspKgvkj9jUTUlj1FTx2',
          'mAVUSIDka3ljTJS76DJIkjXtVsrIHMkl80RoSUo9HEAUUVbfN',
          'mAVUSIK7kYCwVvoTMDwuiUZiPqfnWNJLyy03XYOAsQfwDeJ2O',
          'mAVUSIL/GeDucGpqFkweMBqfnhK0XZRmnZ2kdz8FY/+aam6TW'
        ],
        [
          'mAVUSIKqX9enX45olVXJiXWFy3zP3oZpoDbsZws3MfMPPVIUP',
          'mAVUSIA+NVAYM3I52ErQsl7jqVx1y0XgaEewLTlz0quv9l6gl',
          'mAVUSINcRJfjb5cjLbRE/VzF9yvQTucuRxoByuM3d2jgGShDk',
          'mAVUSIGMxH0NEX7bIwH+8YoFoI2Ru5mI6K6f+9Nor2dj2X0fe'
        ],
        [
          'mAVUSIPJOexMIHtmnsAjacoV1G6mopeFE1aKkpveEcnlfnPEC',
          'mAVUSILbMwMwlHq3W6NxsWcA/c5jOBTmWMMIbwl5wlzze6JEQ',
          'mAVUSIGc0TQARd6Rw6bWMylkrvI4rMpc5ssXqCp6aQ9D+SUtc',
          'mAVUSIP6R2nBq7236HNmCKcjdXnZxgb/jNISB3QzuQXeZvke1'
        ]
      ]
      let result = await saveFile.saveSplits(db, url, dataset, splits, size, testLimits)
      assert(db.items.length === 4)
      assert(db.items[0].size === 4194304)
      assert(db.items[0].dataset === 'chafey-dumbo-drop-test')
      assert(db.items[0].parts.length === 4)
      assert(db.items[0].url === '::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::0')
      assert(db.items[1].size === 4194304)
      assert(db.items[1].dataset === 'chafey-dumbo-drop-test')
      assert(db.items[1].parts.length === 4)
      assert(db.items[1].url === '::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::1')
      assert(db.items[2].size === 3844762)
      assert(db.items[2].dataset === 'chafey-dumbo-drop-test')
      assert(db.items[2].parts.length === 4)
      assert(db.items[2].url === '::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::2')
      assert(db.items[3].size === 12233370)
      assert(db.items[3].dataset === 'chafey-dumbo-drop-test')
      assert(db.items[3].split === true)
      assert(db.items[3].url === 'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR')

      assert(result.length === 4)
      assert(result[0][0].UnprocessedItems)
      assert(Object.keys(result[0][0].UnprocessedItems).length === 0)
      assert(result[1][0].UnprocessedItems)
      assert(Object.keys(result[1][0].UnprocessedItems).length === 0)
    })

    it('saveSplits fails', async () => {
      const db = makeMockDB()
      db.putItem = async (item) => { return Promise.reject(new Error("simulated failure")) }
      const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR"
      const dataset = "chafey-dumbo-drop-test"
      const size = 12233370
      const splits = [
        [
          'mAVUSIOCS5sGDcqo+KTdHYzOxhw8DPspKgvkj9jUTUlj1FTx2',
          'mAVUSIDka3ljTJS76DJIkjXtVsrIHMkl80RoSUo9HEAUUVbfN',
          'mAVUSIK7kYCwVvoTMDwuiUZiPqfnWNJLyy03XYOAsQfwDeJ2O',
          'mAVUSIL/GeDucGpqFkweMBqfnhK0XZRmnZ2kdz8FY/+aam6TW'
        ],
        [
          'mAVUSIKqX9enX45olVXJiXWFy3zP3oZpoDbsZws3MfMPPVIUP',
          'mAVUSIA+NVAYM3I52ErQsl7jqVx1y0XgaEewLTlz0quv9l6gl',
          'mAVUSINcRJfjb5cjLbRE/VzF9yvQTucuRxoByuM3d2jgGShDk',
          'mAVUSIGMxH0NEX7bIwH+8YoFoI2Ru5mI6K6f+9Nor2dj2X0fe'
        ],
        [
          'mAVUSIPJOexMIHtmnsAjacoV1G6mopeFE1aKkpveEcnlfnPEC',
          'mAVUSILbMwMwlHq3W6NxsWcA/c5jOBTmWMMIbwl5wlzze6JEQ',
          'mAVUSIGc0TQARd6Rw6bWMylkrvI4rMpc5ssXqCp6aQ9D+SUtc',
          'mAVUSIP6R2nBq7236HNmCKcjdXnZxgb/jNISB3QzuQXeZvke1'
        ]
      ]
      saveFile.saveSplits(db, url, dataset, splits, size, limits)
        .then(() => { assert(0 && "should not happen") })
        .catch((err) => {
          assert(err)
          assert(err.message === "simulated failure")
          assert(err.name === "Error")
        })
    })

  })
})
