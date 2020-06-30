/* eslint-env mocha */

const assert = require('assert')
const saveFile = require('../src/commands/pull-bucket/save-file')

describe('save-file', () => {

    const makeMockDB = () => {
        const items = []
        return {
            items,
            putItem: async (item) => {
                items.push(item)
            }
        }
    }

    it('exports saveFile, saveSplits and debug', async () => {
        assert(saveFile.saveFile)
        assert(saveFile.saveSplits)
        assert(saveFile.debug)
    })

    /*
    it('saveFile succeeds', async () => {
        const db = makeMockDB()
        const url = "http://foo.com"
        const dataset = "my-bucket"
        const parts = []
        const size = 1024
        await saveFile.saveFile(db, url, dataset, parts, size)
    })
    */

})