// This object limits concurrency in the application by
// blocking while there are more promises than the
// the configured <concurrency> still pending.  It also
// exposes a function wait() which will block until all
// promises complete and the function next() which returns
// a promise that is resolved when any of the pending
// promises are completed.

const limiter = concurrency => {
  const pending = new Set()
  let next
  let nextResolve
  // adds a promise and blocks while the number of pending promises exceed
  // the configured concurrency
  const ret = async promise => {
    const p = (async () => { await promise })()
    pending.add(p)
    p.then(() => pending.delete(p))
    while (pending.size >= concurrency) {
      const r = await Promise.race(Array.from(pending))
      if (next) nextResolve(r)
    }
  }

  // blocks until all pending promises complete
  ret.wait = () => Promise.all(pending)

  // returns a promise that resolves when the next
  // pending promise completes
  ret.next = () => {
    if (!next) {
      next = new Promise(resolve => {
        nextResolve = resolve
      })
      next.then(() => {
        next = null
        nextResolve = null
      })
    }
    return next
  }
  return ret
}

module.exports = limiter
