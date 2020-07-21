const listFiles = require('../pull-bucket/list-files')

run = async (argv, parameters) => {

  const escapedBucket = parameters.bucket.replace('"', '\"')

  const startAfter = undefined

  for await (let file of listFiles.ls(startAfter, parameters)) {
    console.log(`"${escapedBucket}","${file.Key.replace('"', '\"')}","${file.Size}"`)
  }
}

module.exports = run
