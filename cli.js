#!/usr/bin/env node
const pullBucket = require('./src/commands/pull-bucket')
const createParts = require('./src/commands/create-parts')
const commpMakeParameters = require('./src/commands/commp/make-parameters')
const commp = require('./src/commands/commp')
const makeParameters = require('./src/commands/pull-bucket/make-parameters')
const createPartsMakeParameters = require('./src/commands/create-parts/make-parameters')
const verifyMakeParameters = require('./src/commands/verify/make-parameters')
const verify = require('./src/commands/verify')
const checkMakeParameters = require('./src/commands/check/make-parameters')
const check = require('./src/commands/check')

const runPullBucket = async argv => {
  const parameters = makeParameters(argv)
  await pullBucket(parameters)
  // for smoke test, exit immediately because it takes ~10 seconds otherwise (some kind of AWS-SDK related thing)
  if (process.env.DUMBO_DROP_SMOKE_TEST) {
    process.exit(0)
  }
}

const pullBucketOptions = yargs => {
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

const runCreateParts = async argv => {
  const parameters = createPartsMakeParameters(argv)
  await createParts(argv, parameters)
}

const createPartsOptions = yargs => {
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

const runCommp = async argv => {
  const parameters = commpMakeParameters(argv)
  await commp(parameters)
}

const commpOptions = yargs => {
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

const runVerify = async argv => {
  const parameters = verifyMakeParameters(argv)
  await verify(argv, parameters)
}

const verifyOptions = yargs => {
}

const runCheck = async argv => {
  const parameters = checkMakeParameters(argv)
  await check(argv, parameters)
}

const checkOptions = yargs => {
  yargs.option('concurrency', {
    desc: 'Concurrent requests',
    default: 100
  })
  yargs.option('useOldUrls', {
    desc: 'Use Old URL Style (https://${bucket}.s3.amazonaws.com/${key})',
    default: false
  })

}


const yargs = require('yargs')
// eslint-disable-next-line
const args = yargs
  .command('pull-bucket <bucket> [prefix]', 'Parse and store bucket in unique table', pullBucketOptions, runPullBucket)
  .command('create-parts <bucket>', 'Create car files for each one gig data part', createPartsOptions, runCreateParts)
  .command('commp <bucket>', 'Calculate and store commp for the CAR files in a bucket', commpOptions, runCommp)
  .command('verify <bucket>', 'Verifies each file in <bucket> can be restored from CAR files', verifyOptions, runVerify)
  .command('check <bucket>', 'Check to ensure all files in <bucket> are accessble and in DynamoDB', checkOptions, runCheck)
  .argv
