const listFileParts = require('./list-file-parts')
const CarDatastore = require('datastore-car')
const Block = require('@ipld/block')
const bent = require('bent')
const get = bent(200, 206)
const exporter = require('ipfs-unixfs-exporter')

run = async (argv, parameters) => {
  console.log("verify")

  const startAfter = undefined

  for await (let fileParts of listFileParts(startAfter, parameters)) {
    console.log('source file url,size = ', fileParts.url, fileParts.size)

    // create read stream for file from s3
    //const fileStream = await get(fileParts.url)

    // for each car file associated with the original source file
    for (const carFile of fileParts.carFiles) {
      const carFileStream = await get(carFile.url)
      const carDatastore = await CarDatastore.readStreamComplete(carFileStream)
      const roots = await carDatastore.getRoots()
      //console.log('roots=', roots)
      const rootBlockCid = roots[0]
      console.log('fileParts.url=', fileParts.url)
      //console.log('rootBlockCid=', rootBlockCid)
      const rootBlockBuffer = await carDatastore.get(rootBlockCid)
      //console.log('rootBlockBuffer.length=', rootBlockBuffer.length)
      const rootBlock = await Block.decoder(rootBlockBuffer, 'dag-cbor')
      const unixFSV1CIDs = rootBlock.decode();
      console.log('unixFSV1CIDs=', unixFSV1CIDs)

      const ipld = {
        get: async (cid, options) => {
          const buffer = await carDatastore.get(cid)
          const decoder = await Block.decoder(buffer, cid.codec)
          return decoder.decode()
        }
      }

      for (const unixFSV1CID of unixFSV1CIDs) {
        //console.log(unixFSV1CID, unixFSV1CID.codec)

        const entry = await exporter(unixFSV1CID, ipld)
        console.log('entry.name,type=', entry.name, entry.unixfs.type)
        for await (const chunk of entry.content()) {
          // chunk is a Buffer
          console.log('chunk.length=', chunk.length)
        }
      }
      // for each block
      // read next block size bytes from S3

      // compare bytes
      await carDatastore.close()
    }
  }
}


module.exports = run
