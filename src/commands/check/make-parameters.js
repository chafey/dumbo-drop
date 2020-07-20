const makeParameters = (argv) => {
  return {
    // the source bucket to convert files from
    bucket: argv.bucket,
    // the number of concurrent files to process
    concurrency: argv.concurrency,
    // the dynamodb table name to write processed entries to
    tableName: `dumbo-v2-${argv.bucket}`,
  }
}

module.exports = makeParameters
