/* eslint-env mocha */
const assert = require('assert')

const applicationState = require('../../src/commands/pull-bucket/application-state')

describe('pull-bucket', () => {
  describe('application-state', () => {

    it('exports getDefault and resumeFrom functions', async () => {
      assert(applicationState)
      assert(applicationState.getDefault)
      assert(applicationState.resumeFrom)
    })

    it('getDefault returns object', async () => {
      const appState = applicationState.getDefault()
      assert(appState)
    })

    it('resumeFrom with no startAfter updates skippedBytes and returns undefined', async () => {
      const appState = applicationState.getDefault()
      const previousState = {
        completed: 1000
      }
      const startFrom = applicationState.resumeFrom(previousState, appState)
      assert.equal(startFrom, undefined)
      assert.equal(appState.display.skippedBytes, 1000)
    })

    it('resumeFrom with startAfter updates skippedBytes and returns startAfter minus two characters', async () => {
      const appState = applicationState.getDefault()
      const previousState = {
        completed: 1000,
        startAfter: "RESUME_FROM_FILE"
      }
      const startFrom = applicationState.resumeFrom(previousState, appState)
      assert.equal(startFrom, "RESUME_FROM_FI")
      assert.equal(appState.display.skippedBytes, 1000)
    })
  })
})

