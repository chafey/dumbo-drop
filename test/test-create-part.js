/* eslint-env mocha */
const Block = require('@ipld/block')
const assert = require('assert')
const createPart = require('../src/create-part')

describe('create-part', () => {

  const makeMockStore = () => {
    const cids = []
    return {
      cids,
      get: async (cid) => {
        //console.log('cid=', cid)
        cids.push(cid)
        return Block.encoder(Buffer.from("testBlock"), 'raw')
      }
    }
  }

  const mockCreateUploadStream = (opts) => {
    let onceCallbacks = {}
    let writes = []
    return {
      writes,
      write: (chunk, callback) => {
        writes.push(chunk)
        //console.log('WRITE chunk=', chunk)
        //console.log('WRITE callback=', callback)
        callback()
        return true
      },
      end: (chunk, callback) => {
        //console.log('END chunk=', chunk)
        //console.log('END callback=', callback)
        onceCallbacks['finish']()
        onceCallbacks['uploaded']({
          Location: 'https://dumbo-v2-cars-chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi%2Fbafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi.car',
          Bucket: opts.Bucket,
          Key: opts.Key,
          ETag: '"15bfa6297cf5d04e2905f3980150c602-1"'
        })
      },
      once: (event, callback) => {
        //console.log('ONCE event=', event)
        onceCallbacks[event] = callback
      }
    }
  }


  it('exports function', async () => {
    assert(createPart)
  })

  it('succeeds', async () => {
    const buffer = Buffer.from("testBlock")
    const block = Block.encoder(buffer, 'raw')
    const files = {
      'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR': [[(await block.cid()).toString('base64')], buffer.length]
    }
    const carFileBucket = 'dumbo-v2-cars-chafey-dumbo-drop-test'
    const store = makeMockStore()
    const mockS3Stream = {
      upload: mockCreateUploadStream
    }
    const result = await createPart(files, carFileBucket, store, mockS3Stream)
    //console.log(result)
    assert(result)
    assert.equal(result.details.Location, "https://dumbo-v2-cars-chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi%2Fbafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi.car")
    assert.equal(result.details.Bucket, "dumbo-v2-cars-chafey-dumbo-drop-test")
    assert.equal(result.details.Key, "bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi/bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi.car")
    assert(result.results["https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"])
    assert.equal(result.results["https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"][0], 0)
    assert.equal(result.results["https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR"][1], 'bafybeiembjnglddczpwwgrwbciliwauabvh67hlvzigd3xxk4x73xxytxu')
    assert.equal(result.root, "bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi")
    assert.equal(result.carFilename, "bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi/bafyreiduhdkabccfquemrjbddbpmwbsuwupvctud745x2ojtmeqgm3a4vi.car")
  })


  /*
  files= {
    'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR': [ [ 'mAVUSIBIfd3Bfjibu+qyv4Ne+zI3ULJtVU+PcuQQoPZqWyfFq' ], 180916 ],
    '::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::1': [
      [
        'mAVUSIGc0TQARd6Rw6bWMylkrvI4rMpc5ssXqCp6aQ9D+SUtc',
        'mAVUSIP6R2nBq7236HNmCKcjdXnZxgb/jNISB3QzuQXeZvke1'
      ],
      1747610
    ],
    'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT2_J2KR': [ [ 'mAVUSIJViD/PQ5QYiaFNQfUpExLesbcSf0d0TRg7ZekfhhK0D' ], 121356 ]
  }*/



  /*
  resp= {
    details: {
      Location: 'https://dumbo-v2-cars-chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci%2Fbafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car',
      Bucket: 'dumbo-v2-cars-chafey-dumbo-drop-test',
      Key: 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car',
      ETag: '"15bfa6297cf5d04e2905f3980150c602-1"'
    },
    results: {
      'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT1_J2KR': [
        0,
        'bafybeifl47no3icef57z5lj3cqeb6ppg2ldeiqgp5frnaeu3subiibeudi'
      ],
      '::split::https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/MG1_J2KR::1': [
        1,
        'bafybeiclqev43aqpibfdqu2buhvas4wjgoryccexvylqjqplelvuw5zrai'
      ],
      'https://chafey-dumbo-drop-test.s3.us-west-2.amazonaws.com/CT2_J2KR': [
        2,
        'bafybeielzsrxvmeqzjcimukr22uq4s2eqtq5njlvbqytrd4quq7nflk4du'
      ]
    },
    root: 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci',
    carFilename: 'bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci/bafyreidigczbx3d3fbpabihjh3lmeoppdlriaipuityslbl4kgaud6bkci.car'
  }*/


})
