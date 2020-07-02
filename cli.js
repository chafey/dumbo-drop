#!/usr/bin/env node
const parseBucketV2 = require('./src/commands/pull-bucket')
const createPartsV2 = require('./src/commands/create-parts')
const commp = require('./src/commands/commp')
const inspect = require('./src/commands/inspect')
const makeSettings = require('./src/commands/pull-bucket/make-settings')
const runPullBucketV2 = async argv => {
  const settings = makeSettings(argv)
  await parseBucketV2(settings)
  console.log('all done :)')
  //console.log(process._getActiveHandles().length) // WriteStream x2, TLSSocket to dynamodb.us-west-2.amazonaws.com
  //console.log(process._getActiveRequests().length)
  process.exit(0) // HACK: force process to exit because it takes ~10 seconds to exit
}

const bucketOptions = yargs => {
  yargs.option('concurrency', {
    desc: 'Concurrent Lambda requests',
    default: 100
  })
  yargs.option('checkHead', {
    desc: 'Perform HEAD request to verify access to every URL',
    default: false,
    type: 'boolean'
  })
  yargs.option('force', {
    desc: 'Overwrite existing data instead of skipping',
    default: false,
    type: 'boolean'
  })
  yargs.option('local', {
    desc: 'Run processing function local (instead of remote with AWS lambda)',
    default: false,
    type: 'boolean'
  })
}

const createParts2Options = yargs => {
  yargs.option('concurrency', {
    desc: 'Concurrent Lambda requests',
    default: 100
  })
  yargs.option('local', {
    desc: 'Run processing function local (instead of remote with AWS lambda)',
    default: false,
    type: 'boolean'
  })
}

const inspectOptions = yargs => {
  yargs.option('clean', {
    desc: 'Clean known bad data',
    boolean: true,
    default: false
  })
  yargs.option('checkCarFiles', {
    desc: 'Pull down car files and validate their contents',
    boolean: true,
    default: false
  })
  yargs.option('showItems', {
    desc: 'Print every item',
    boolean: true,
    default: false
  })
  yargs.option('showUrls', {
    desc: 'Print every URL',
    boolean: true,
    default: false
  })
}

const commpOptions = yargs => {
  bucketOptions(yargs)
  yargs.option('concurrency', {
    desc: 'Concurrent Lambda requests',
    default: 300
  })
  yargs.option('force', {
    desc: 'Overwrite existing car files if they exist',
    boolean: true,
    default: false
  })
  yargs.option('silent', {
    desc: 'Suppress realtime info',
    boolean: true,
    default: false
  })
}

const yargs = require('yargs')
// eslint-disable-next-line
const args = yargs
  .command('pull-bucket-v2 <bucket> [prefix]', 'Parse and store bucket in unique table', bucketOptions, runPullBucketV2)
  .command('create-parts-v2 <bucket>', 'Create car files for each one gig data part', createParts2Options, createPartsV2)
  .command('inspect <bucket>', 'Inspect data about each entry for the bucket', inspectOptions, inspect)
  .command('commp <bucket>', 'Calculate and store commp for the CAR files in a bucket', commpOptions, commp)
  .argv
