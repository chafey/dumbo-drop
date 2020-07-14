const listFileParts = require('./list-file-parts')
const CarDatastore = require('datastore-car')
const Block = require('@ipld/block')
const bent = require('bent')
const get = bent(200, 206)
const exporter = require('ipfs-unixfs-exporter')

const makeIPLD = async (carUrl) => {
  const carDatastore = await CarDatastore.readStreamComplete(await get(carUrl))
  return {
    get: async (cid, options) => {
      const buffer = await carDatastore.get(cid)
      const decoder = await Block.decoder(buffer, cid.codec)
      return decoder.decode()
    },
    close: async () => { await carDatastore.close() }
  }
}

run = async (argv, parameters) => {
  const startAfter = undefined

  for await (let fileParts of listFileParts(startAfter, parameters)) {
    console.log('source file url,size = ', fileParts.url, fileParts.size)

    // create read stream for file from s3
    const sourceFileStream = await get(fileParts.url)
    const sourceFileBuffer = await sourceFileStream.arrayBuffer()
    if (fileParts.size !== sourceFileBuffer.length) {
      console.log("ERROR - file size mismatch", filePars.size, sourceFileBuffer.length)
      continue
    }
    let sourceFileBufferIndex = 0
    // for each car file associated with the original source file
    for (const carFile of fileParts.carFiles) {

      const ipld = await makeIPLD(carFile.url)

      const unixFSV1CID = carFile.root[2]

      const entry = await exporter(unixFSV1CID, ipld)
      //console.log('entry.name,type=', entry.name, entry.unixfs.type)
      for await (const chunk of entry.content()) {
        //console.log('chunk.length=', chunk.length)
        for (var i = 0; i < chunk.length; i++) {
          if (chunk[i] !== sourceFileBuffer[sourceFileBufferIndex++]) {
            console.log('ERROR - bytes differ at position ', sourceFileBufferIndex)
            await ipld.close()
            return
          }
        }
      }
      await ipld.close()
    }
    console.log("SUCCESS - bytes are the same")
  }
}


module.exports = run
