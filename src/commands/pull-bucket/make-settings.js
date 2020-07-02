const makeSettings = (argv) => {
  return {
    bucket: argv.bucket,
    prefix: argv.prefix,
    concurrency: argv.concurrency,
    checkHead: argv.checkHead,
    force: argv.force,
    local: argv.local,
    // how frequently the processing state should be saved
    saveStateIntervalMS: 10000
  }
}

module.exports = makeSettings
