// returns an object containing the default/clean application state
const getDefault = () => {
  return {
    // the most recent S3 url we are parseing.  This is written out to the state
    // file so we can continue from this point in case the app crashes
    latest: undefined,

    // list of S3 URLs currently being parsed/chunked.
    inflight: [],

    // display contains various statistics we display to the user while  processing
    display: {
      skippedFiles: 0, // number of files skipped
      skippedBytes: 0, // number of bytes skipped (from skipped files)
      processedFiles: 0, // number of files processed
      processedBytes: 0 // number of bytes processed (from files processed)
    }
  }
}

// updates the application state given a previous processing state.  If the previous
// processing state indicates a file was being processed, return it.  otherwise return null
const resumeFrom = (previousState, appState) => {
  appState.display.skippedBytes = previousState.completed
  if (previousState.startAfter) {
    const startAfter = previousState.startAfter.slice(0, previousState.startAfter.length - 2)
    return startAfter
  }
}

module.exports = {
  getDefault,
  resumeFrom
}
