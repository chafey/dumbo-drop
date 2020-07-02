const makeSettings = (argv) => {
  return {
    bucket: argv.bucket,
    prefix: argv.prefix,
    startAfter: argv.start,
    concurrency: argv.concurrency,
    checkHead: argv.checkHead,
    force: argv.force,
    local: argv.local,
  }
}

module.exports = makeSettings
