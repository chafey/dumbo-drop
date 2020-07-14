const makeCommandState = () => {
  return {
    // the number of commp lambda requests that returned an error
    fails: 0,
    // the number of CAR files skipped (because commp has already been calculated)
    skips: 0,
    // the count in bytes of CAR files skipped (because commp has already been calculated)
    skippedBytes: 0,
    // the number of CAR files succesfully processed
    completed: 0,
    // the count in bytes of CAR files succesfully processed
    completedBytes: 0,
    // the number of commp lambda requests currently running
    inflight: 0
  }
}


module.exports = makeCommandState
