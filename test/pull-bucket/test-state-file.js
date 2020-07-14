/* eslint-env mocha */
const assert = require('assert')
const stateFile = require('../../src/commands/pull-bucket/state-file')

describe('pull-bucket', () => {

  describe('state-file', () => {

    it('exports save, load', async () => {
      assert(stateFile.save)
      assert(stateFile.load)
    })

    it('load returns null on no state file', async () => {
      let readPath;
      const mockReadFile = async (path) => {
        readPath = path
        throw new Error("simulated error")
      }
      const bucket = 'test-bucket'
      const result = await stateFile.load(bucket, mockReadFile)
      assert.equal(result, null)
      assert.equal(readPath, '.state-test-bucket')
    })

    it('load returns null on invalid state file', async () => {
      let readPath;
      const mockReadFile = async (path) => {
        readPath = path
        return Buffer.from("")
      }
      const bucket = 'test-bucket'
      const result = await stateFile.load(bucket, mockReadFile)
      assert.equal(result, null)
      assert.equal(readPath, '.state-test-bucket')
    })

    it('load returns valid state object on state file', async () => {
      let readPath;
      const mockReadFile = async (path) => {
        readPath = path
        return Buffer.from(JSON.stringify({ completed: 100, startAfter: "TEST_FILE_NAME" }))
      }
      const bucket = 'test-bucket'
      const result = await stateFile.load(bucket, mockReadFile)
      assert.equal(readPath, '.state-test-bucket')
      assert(result)
      assert.equal(result.completed, 100)
      assert.equal(result.startAfter, 'TEST_FILE_NAME')
    })

    it('save succeeds with empty appState', async () => {
      let writePath
      let writeData
      const mockWriteFileSync = async (path, data) => {
        writePath = path
        writeData = data
      }

      const bucket = 'test-bucket'
      const appState = {
        inflight: [],
        latest: undefined,
        display: {
          processedBytes: 0,
          skippedBytes: 0
        }
      }

      await stateFile.save(appState, bucket, mockWriteFileSync)
      assert.equal(writePath, '.state-test-bucket')
      const data = JSON.parse(writeData)
      assert.equal(data.completed, 0)
      assert.equal(data.startAfter, undefined)
    })

    it('save succeeds with appState display but no inflight', async () => {
      let writePath
      let writeData
      const mockWriteFileSync = async (path, data) => {
        writePath = path
        writeData = data
      }

      const bucket = 'test-bucket'
      const appState = {
        inflight: [],
        latest: undefined,
        display: {
          processedBytes: 100,
          skippedBytes: 1000
        }
      }

      await stateFile.save(appState, bucket, mockWriteFileSync)
      assert.equal(writePath, '.state-test-bucket')
      const data = JSON.parse(writeData)
      assert.equal(data.completed, 1100)
      assert.equal(data.startAfter, undefined)
    })


    it('save succeeds with appState display and inflight', async () => {
      let writePath
      let writeData
      const mockWriteFileSync = async (path, data) => {
        writePath = path
        writeData = data
      }

      const bucket = 'test-bucket'
      const appState = {
        inflight: ["INFLIGHT_FILE_NAME"],
        latest: "TEST_FILE_NAME",
        display: {
          processedBytes: 100,
          skippedBytes: 1000
        }
      }

      await stateFile.save(appState, bucket, mockWriteFileSync)
      assert.equal(writePath, '.state-test-bucket')
      const data = JSON.parse(writeData)
      assert.equal(data.completed, 1100)
      assert.equal(data.startAfter, "INFLIGHT_FILE_NAME")
    })

    it('save succeeds with appState display and no inflight but latest', async () => {
      let writePath
      let writeData
      const mockWriteFileSync = async (path, data) => {
        writePath = path
        writeData = data
      }

      const bucket = 'test-bucket'
      const appState = {
        inflight: [],
        latest: "TEST_FILE_NAME",
        display: {
          processedBytes: 100,
          skippedBytes: 1000
        }
      }

      await stateFile.save(appState, bucket, mockWriteFileSync)
      assert.equal(writePath, '.state-test-bucket')
      const data = JSON.parse(writeData)
      assert.equal(data.completed, 1100)
      assert.equal(data.startAfter, "TEST_FILE_NAME")
    })
  })
})
