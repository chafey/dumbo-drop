const makeParameters = (argv) => {
  return {
    // the source bucket to convert files from
    bucket: argv.bucket,
    // the number of concurrent files to process
    concurrency: argv.concurrency,
    // overwrite existing files if they exist
    force: argv.force,
    // runs silently - without printing processing progress
    silent: argv.silent,
    // the S3 bucket to write CAR files too
    carFileBucket: `dumbo-v2-cars-${argv.bucket}`,
    // the dynamodb table name to write processed entries to
    tableName: `dumbo-v2-${argv.bucket}`,
    // the name of the lambda function for parsing files
    createPartLambda: process.env.DUMBO_COMMP_LAMBDA
  }
}

module.exports = makeParameters
