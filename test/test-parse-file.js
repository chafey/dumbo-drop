/* eslint-env mocha */

const assert = require('assert')
const parseFile = require('../src/commands/pull-bucket/parse-file')

describe('parse-file', () => {

    it('exports files, debug', async () => {
        assert(parseFile)
        assert(parseFile.files)
        assert(parseFile.debug)
    })

    /*
    it('parseFile success', async () => {
        const db
        parseFile(db, blockBucket, url, dataset, size, local, limits)
    })
    */
})