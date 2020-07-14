/* eslint-env mocha */

const assert = require('assert')
const parseFile = require('../../src/commands/pull-bucket/parse-file')

describe('pull-bucket', () => {
  describe('parse-file', () => {

    it('exports files, debug', async () => {
      assert(parseFile.parseFile)
      assert(parseFile.parseFiles)
      assert(parseFile.debug)
    })

    /*
    it('parseFile success', async () => {
        const db
        parseFile(db, blockBucket, url, dataset, size, local, limits)
    })
    */
  })
})
