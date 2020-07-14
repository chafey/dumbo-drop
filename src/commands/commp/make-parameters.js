const makeParameters = (argv) => {
  return {
    // the bucket with car files
    bucket: argv.bucket,
    // the number of concurrent files to process
    concurrency: argv.concurrency,
    // overwrite existing files if they exist
    force: argv.force,
    // runs silently - without printing processing progress
    silent: argv.silent,
    // the dynamodb table name to write processed entries to
    tableName: process.env.DUMBO_COMMP_TABLE,
    // the name of the lambda function for parsing files
    commpLambda: 'commpFromCarFile'
  }
}

module.exports = makeParameters
