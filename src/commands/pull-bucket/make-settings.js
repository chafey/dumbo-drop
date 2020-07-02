const makeSettings = (argv) => {
  return {
    bucket: argv.bucket,
    prefix: argv.prefix,
    concurrency: argv.concurrency,
    checkHead: argv.checkHead,
    force: argv.force,
    local: argv.local,

    // internal settings (not configurable via cli)
    internal: {
      // how frequently the processing state should be saved
      saveStateIntervalMS: 10000,
      //saveStateIntervalMS: 100,
      // how frequently the progress is updated
      progressIntervalMS: 1000
    }
  }
}

module.exports = makeSettings
