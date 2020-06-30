/* eslint-env mocha */
const Block = require('@ipld/block')

const assert = require('assert')
const createStore = require('../src/store')
const makeMockS3 = require('./mock-s3.js')

describe('store', () => {

  const makeMockBlock = () => {
    return Block.encoder({}, 'dag-cbor')
  }

  it('returns get and put', async () => {
    const store = createStore(Block, "test-bucket")
    assert(store)
    assert(store.get)
    assert(store.put)
  })

  it('put succeeds', async () => {
    const mockS3 = makeMockS3()
    const store = createStore(Block, "test-bucket", 'public-read', mockS3)
    const mockBlock = makeMockBlock()
    await store.put(mockBlock)
    assert(mockS3.putParams.length)
    assert(mockS3.putParams[0].ACL == 'public-read')
    assert(mockS3.putParams[0].Bucket == 'test-bucket')
    assert(mockS3.putParams[0].Body.length == 1)
    assert(mockS3.putParams[0].Key === 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua/encode')
  })

  it('get succeeds', async () => {
    const mockS3 = makeMockS3()
    const store = createStore(Block, "test-bucket", 'public-read', mockS3)
    await store.get('bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua')
    assert(mockS3.getParams.length)
    assert(mockS3.getParams[0].Bucket =='test-bucket')
    assert(mockS3.getParams[0].Key == 'bafyreigbtj4x7ip5legnfznufuopl4sg4knzc2cof6duas4b3q2fy6swua/encode')
  })


})