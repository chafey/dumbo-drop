const makeParameters = (argv) => {
  return {
    // the source bucket to convert files from
    bucket: argv.bucket,
    // The prefix to process
    prefix: argv.prefix,
    // the number of concurrent files to process
    concurrency: argv.concurrency,
    // true if we should issue a HTTP HEAD request and skip it if it returns 403
    checkHead: argv.checkHead,
    // true if we should overwrite existing data
    force: argv.force,
    // true if we should run processing using a local function, false to use lambda
    local: argv.local,
    // the S3 bucket to write IPLD blocks too
    blockBucket: process.env.DUMBO_BLOCK_STORE,
    // the dynamodb table name to write processed entries to
    tableName: `dumbo-v2-${argv.bucket}`,
    // the name of the lambda function for parsing files
    parseFileLambda: process.env.DUMBO_PARSE_FILE_LAMBDA,
  }
}

module.exports = makeParameters
