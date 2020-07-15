/* eslint-env mocha */
const assert = require('assert')

const executeCommp = require('../../src/commands/commp/execute-commp')

describe('commp', () => {
  describe('execute-commp', () => {
    it('exports function', async () => {
      assert(executeCommp)
    })

    it('success', async () => {
      const mockDB = {
        putItem: async (obj) => {
        }
      }
      const key = "bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car"
      const state = {
        inflight: 0,
        fails: 0,
        completed: 0,
        completedBytes: 0
      }
      const parameters = {
        bucket: 'test-bucket',
        commpLambda: 'commp'
      }
      const mockRequest = async (lambdaFunction, opts) => {
        return {
          bucket: 'test-bucket',
          commp: 'deb1271943a36b0544841fcbe4b6d06139b1b6e3b3d575c952c5c06abf550609',
          key: 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car',
          paddedSize: 2080768,
          pieceSize: 2097152,
          region: 'us-west-2',
          size: 2050595
        }
      }

      const result = await executeCommp(mockDB, key, state, parameters, mockRequest)
      assert(result)
      assert.equal(result.root, 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci')
      assert.equal(result.bucket, 'test-bucket')
      assert.equal(result.commp, 'deb1271943a36b0544841fcbe4b6d06139b1b6e3b3d575c952c5c06abf550609')
      assert.equal(result.key, 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car')
      assert.equal(result.paddedSize, 2080768)
      assert.equal(result.pieceSize, 2097152)
      assert.equal(result.region, 'us-west-2')
      assert.equal(result.size, 2050595)
      assert.equal(state.inflight, 0)
      assert.equal(state.fails, 0)
      assert.equal(state.completed, 1)
      assert.equal(state.completedBytes, 2050595)
    })

    it('commp lambda fails', async () => {
      const mockDB = {
        putItem: async (obj) => {
        }
      }
      const key = "test-key"
      const state = {
        inflight: 0,
        fails: 0,
        completed: 0,
        completedBytes: 0
      }
      const parameters = {
        bucket: 'test-bucket',
        commpLambda: 'commp'
      }
      const mockRequest = async (lambdaFunction, opts) => {
        return Promise.reject(new Error('simulated failure'))
      }

      const result = await executeCommp(mockDB, key, state, parameters, mockRequest)
      assert.equal(result, null)
      assert.equal(state.inflight, 1)
      assert.equal(state.fails, 1)
      assert.equal(state.completed, 0)
      assert.equal(state.completedBytes, 0)
    })

    it('dynamodb update fails', async () => {
      const mockDB = {
        putItem: async (obj) => {
          return Promise.reject(new Error("simulated failure"))
        }
      }
      const key = "test-key"
      const state = {
        inflight: 0,
        fails: 0,
        completed: 0,
        completedBytes: 0
      }
      const parameters = {
        bucket: 'test-bucket',
        commpLambda: 'commp'
      }
      const mockRequest = async (lambdaFunction, opts) => {
        return {
          bucket: 'test-bucket',
          commp: 'deb1271943a36b0544841fcbe4b6d06139b1b6e3b3d575c952c5c06abf550609',
          key: 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car',
          paddedSize: 2080768,
          pieceSize: 2097152,
          region: 'us-west-2',
          size: 2050595
        }
      }

      const result = executeCommp(mockDB, key, state, parameters, mockRequest)
      let error;
      result.then(() => {
        assert(0 && "should not happen")
      }).catch((err) => {
        error = err
      }).finally(() => {
        assert(error)
        assert(error.message === "simulated failure")
        assert(error.name === "Error")
        assert.equal(state.inflight, 0)
        assert.equal(state.fails, 0)
        assert.equal(state.completed, 0)
        assert.equal(state.completedBytes, 0)
      })
    })
  })
})
