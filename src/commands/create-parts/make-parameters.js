const makeParameters = (argv) => {
  return {
    // the source bucket to convert files from
    bucket: argv.bucket,
    // the number of concurrent files to process
    concurrency: argv.concurrency,
    // true if we should run processing using a local function, false to use lambda
    local: argv.local,
    // the S3 bucket to write IPLD blocks too
    blockBucket: process.env.DUMBO_BLOCK_BUCKET,
    // the S3 bucket to write CAR files too
    carFileBucket: `dumbo-v2-cars-${argv.bucket}`,
    // the dynamodb table name to write processed entries to
    tableName: `dumbo-v2-${argv.bucket}`,
    // the name of the lambda function for parsing files
    createPartLambda: process.env.DUMBO_CREATE_PART_LAMBDA,
  }
}

module.exports = makeParameters
