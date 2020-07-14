/* eslint-env mocha */
const assert = require('assert')

const getCarParts = require('../../src/commands/commp/get-car-parts')

describe('commp', () => {
  describe('get-car-parts', () => {
    it('exports function', async () => {
      assert(getCarParts)
    })

    it('zero results succeeds', async () => {
      const bucket = 'tet-bucket'
      const mockS3 = {
        listObjectsV2: (opts) => {
          return {
            promise: async () => {
              return {
                Contents: []
              }
            }
          }
        }
      }
      let numCarParts = 0
      for await (const { Key } of getCarParts(bucket, mockS3)) {
        numCarParts++
      }
      assert.equal(numCarParts, 0)
    })

    it('one result succeeds', async () => {
      const bucket = 'tet-bucket'
      let contentIndex = 0
      const mockS3 = {
        listObjectsV2: (opts) => {
          return {
            promise: async () => {
              contentIndex = contentIndex + 1
              if (contentIndex === 1) {
                return {
                  Contents: [{
                    Key: 'test-key'
                  }]
                }
              } else {
                return {
                  Contents: []
                }
              }
            }
          }
        }
      }
      let numCarParts = 0
      for await (const { Key } of getCarParts(bucket, mockS3)) {
        numCarParts++
      }
      assert.equal(numCarParts, 1)
    })

    it('error fails', async () => {
      const bucket = 'tet-bucket'
      const mockS3 = {
        listObjectsV2: (opts) => {
          return {
            promise: async () => {
              return Promise.reject(new Error("simulated failure"))
            }
          }
        }
      }
      let numCarParts = 0
      let error
      try {
        for await (const { Key } of getCarParts(bucket, mockS3)) {
          numCarParts++
          assert(0 && "should not get here")
        }
      } catch (e) {
        error = e
      }
      assert(error)
      assert.equal(numCarParts, 0)
    })
  })
})
