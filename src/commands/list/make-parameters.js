const makeParameters = (argv) => {
  return {
    // the source bucket with files to convert
    bucket: argv.bucket,
  }
}

module.exports = makeParameters
