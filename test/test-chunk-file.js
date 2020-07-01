/* eslint-env mocha */
const Block = require('@ipld/block')
//const createStore = require('../src/store')
const { Readable } = require("stream")

const assert = require('assert')
const createLimiter = require('../src/limiter')
const chunkFile = require('../src/chunk-file')
const bent = require('bent')
const get = bent(200, 206)

describe('chunk-file', () => {

    class StatusError extends Error {
        constructor (res, ...params) {
          super(...params)
      
          Error.captureStackTrace(this, StatusError)
          this.name = 'StatusError'
          this.message = res.statusMessage
          this.statusCode = res.statusCode
          this.json = res.json
          this.text = res.text
          this.arrayBuffer = res.arrayBuffer
          this.headers = res.headers
          let buffer
          const get = () => {
            if (!buffer) buffer = this.arrayBuffer()
            return buffer
          }
          Object.defineProperty(this, 'responseBody', { get })
        }
      }
      

    const makeMockStore = () => {
        const blocks = []
        return {
            blocks,
            put: async (block) => {blocks.push(block)},
            get: async (cid) => {
                return Block.create("", cid)
            }
        }
    }

    const mockGet = async (url, headers) => Readable.from(Buffer.from(url, 'utf8'))
    const mockGetFailing = async (url, headers) => Promise.reject(new StatusError({statusCode: 401}))

    it('exports function', async () => {
        assert(chunkFile)
    })

    it('success zero length file', async () => {
        const store = makeMockStore()
        const limit = createLimiter(100)
        const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
        const headers = undefined
        const emptyGet = async (url, headers) => Readable.from(Buffer.from("", 'utf8'))
        const result = await chunkFile(store, mockGet, limit, url, headers)
        assert(store.blocks.length === 1)
        assert(result.length === 1)
        assert(result[0].toString() === "bafkreidiy3afvp5t7j27n4lvhnend6ca7jpd23jnexnuuhwklirg7762d4")
    })


    it('success one chunk', async () => {
        const store = makeMockStore()
        const limit = createLimiter(100)
        const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
        const headers = undefined
        const result = await chunkFile(store, mockGet, limit, url, headers)
        assert(store.blocks.length === 1)
        assert(result.length === 1)
        assert(result[0].toString() === "bafkreidiy3afvp5t7j27n4lvhnend6ca7jpd23jnexnuuhwklirg7762d4")
    })

    it('success two chunks', async () => {
        const store = makeMockStore()
        const limit = createLimiter(100)
        const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
        const headers = undefined
        const retries = 2
        const limits = {
            MAX_BLOCK_SIZE : 64
        }
        const result = await chunkFile(store, mockGet, limit, url, headers, retries, limits)
        assert(store.blocks.length === 2)
        assert(result.length === 2)
        assert(result[0].toString() === "bafkreid2im5bmxarzawe2qppuwkgtdhknozdajw744gi52glfrlsxkvk5e")
        assert(result[1].toString() === "bafkreih2gt4xx5f4wwap27nljtfelrt3tlcp2rcs4bckfhvt3kgrdlckiy")
    })

    it('success on retry', async () => {
        let error = true
        const get = async (url, headers) => {
            if(error) {
                error = false
                return mockGetFailing(url, headers)
            } else {
                return mockGet(url, headers)
            }
        }
        const store = makeMockStore()
        const limit = createLimiter(100)
        const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
        const headers = undefined
        const result = await chunkFile(store, get, limit, url, headers)
        //console.log(result)
        assert(store.blocks.length === 1)
        assert(result.length === 1)
        assert(result[0].toString() === "bafkreidiy3afvp5t7j27n4lvhnend6ca7jpd23jnexnuuhwklirg7762d4")
    })

    it('fails', async () => {
        const store = makeMockStore()
        const limit = createLimiter(100)
        const url = "https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"
        const headers = undefined
        chunkFile(store, mockGetFailing, limit, url, headers)
        .then(() => {assert(0 && "should not happen")})
        .catch((err) => {
            assert(err)
            assert(err.message === 'Unacceptable error code: 401 for https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR')
        })
    })



})