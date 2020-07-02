/* eslint-env mocha */

const assert = require('assert')
const listFiles = require('../src/commands/pull-bucket/list-files')


describe('list-files', () => {

  makeMockS3 = (responses) => {
    let index = 0
    return {
      listObjectsV2: (opts) => {
        return {
          promise: async () => {
            if (index >= responses.length) {
              return {
                Contents: []
              }
            }
            return responses[index++]
          }
        }
      }
    }
  }

  it('exports ls', async () => {
    assert(listFiles.ls)
  })

  it('ls succeeds with zero responses', async () => {
    const responses = []
    const s3 = makeMockS3(responses)
    const settings = {
      bucket: "chafey-dumbo-drop-test",
      prefix: "",
      startAfter: ""
    }
    const fileInfos = []
    for await (let fileInfo of listFiles.ls(settings, s3)) {
      fileInfos.push(fileInfo)
    }
    assert(fileInfos.length === 0)
  })


  it('ls succeeds with one response', async () => {
    const responses = [{
      Contents: [
        {
          Key: 'MG1_J2KR',
          LastModified: '2020-06-29T15:57:33.000Z',
          ETag: '"d2bfefa01118a9d941becc180f5013dc"',
          Size: 12233370,
          StorageClass: 'STANDARD'
        }
      ]
    }]
    const s3 = makeMockS3(responses)
    const settings = {
      bucket: "chafey-dumbo-drop-test",
      prefix: "",
      startAfter: "CT1_J2KR"
    }
    const fileInfos = []
    for await (let fileInfo of listFiles.ls(settings, s3)) {
      fileInfos.push(fileInfo)
    }
    assert(fileInfos.length === 1)
  })

  it('ls succeeds with two responses', async () => {
    const responses = [{
      Contents: [{
        Key: 'MG1_J2KR',
        LastModified: '2020-06-29T15:57:33.000Z',
        ETag: '"d2bfefa01118a9d941becc180f5013dc"',
        Size: 12233370,
        StorageClass: 'STANDARD'
      }]
    }, {
      Contents: [{
        Key: 'MG1_J2KR',
        LastModified: '2020-06-29T15:57:33.000Z',
        ETag: '"d2bfefa01118a9d941becc180f5013dc"',
        Size: 12233370,
        StorageClass: 'STANDARD'
      }]
    }]
    const s3 = makeMockS3(responses)
    const settings = {
      bucket: "chafey-dumbo-drop-test",
      prefix: "",
      startAfter: "CT1_J2KR"
    }
    const fileInfos = []
    for await (let fileInfo of listFiles.ls(settings, s3)) {
      fileInfos.push(fileInfo)
    }
    assert(fileInfos.length === 2)
  })

  it('ls succeeds with one response, two items', async () => {
    const responses = [{
      Contents: [{
        Key: 'MG1_J2KR',
        LastModified: '2020-06-29T15:57:33.000Z',
        ETag: '"d2bfefa01118a9d941becc180f5013dc"',
        Size: 12233370,
        StorageClass: 'STANDARD'
      }, {
        Key: 'MG1_J2KR',
        LastModified: '2020-06-29T15:57:33.000Z',
        ETag: '"d2bfefa01118a9d941becc180f5013dc"',
        Size: 12233370,
        StorageClass: 'STANDARD'
      }]
    }]
    const s3 = makeMockS3(responses)
    const settings = {
      bucket: "chafey-dumbo-drop-test",
      prefix: "",
      startAfter: "CT1_J2KR"
    }
    const fileInfos = []
    for await (let fileInfo of listFiles.ls(settings, s3)) {
      fileInfos.push(fileInfo)
    }
    assert(fileInfos.length === 2)
  })

  it('ls fails', async () => {
    const s3 = makeMockS3([])
    s3.listObjectsV2 = (opts) => {
      return {
        promise: () => { return Promise.reject(new Error("simulated failure")) }
      }
    }
    const settings = {
      bucket: "chafey-dumbo-drop-test",
      prefix: "",
      startAfter: "CT1_J2KR"
    }

    try {
      for await (let fileInfo of listFiles.ls(settings, s3)) {
        console.log(fileInfo)
      }
      assert(0 && "should not get here")
    } catch (err) {
      assert(err)
      assert(err.message === "simulated failure")
      assert(err.name === "Error")
    }
  })
})
