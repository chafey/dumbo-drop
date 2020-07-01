/* eslint-env mocha */

const assert = require('assert')
const createLimiter = require('../src/limiter')

describe('limiter', () => {

  const resolver = async (promise) => { return promise }

  const isPromise = (promise) => { return promise && promise.then && typeof promise.then === 'function' }

  it('returns promise with wait and next', async () => {
    const limiter = createLimiter(50)
    assert(limiter)
    assert(limiter.wait)
    assert(limiter.next)
  })

  it('adding resolved promise returns promise', async () => {
    const limiter = createLimiter(1)
    const result = limiter(resolver(Promise.resolve()))
    assert(isPromise(result))
  })

  it('adding pending promise returns promise', async () => {
    const limiter = createLimiter(1)
    const result = limiter(resolver(new Promise(() => { })))
    assert(isPromise(result))
  })

  it('adding resolved promise returns resolved promise', async () => {
    const limiter = createLimiter(1)
    await limiter(resolver(Promise.resolve()))
  })

  it('adding pending returns promise', async () => {
    const limiter = createLimiter(1)
    let resolveIt;
    const promise = new Promise((resolve) => { resolveIt = resolve });
    const first = limiter(resolver(promise))
    const second = limiter(resolver(Promise.resolve()))
    resolveIt();
    await first;
    await second;
  })

  it('wait() returns promise', async () => {
    const limiter = createLimiter(1)
    const result = limiter.wait()
    assert(isPromise(result))
  })

  it('wait() returns resolved promise', async () => {
    const limiter = createLimiter(1)
    const result = limiter(resolver(Promise.resolve()))
    await limiter.wait()
  })

  it('next() returns undefined', async () => {
    const limiter = createLimiter(1)
    const result = limiter.next()
    assert(result, undefined)
  })

  it('next() returns promise', async () => {
    const limiter = createLimiter(1)
    let resolveIt;
    const promise = new Promise((resolve) => { resolveIt = resolve });
    const result = limiter.next()
    assert(isPromise(result))
  })

  it('next() resolves', async () => {
    const limiter = createLimiter(1)
    let resolveIt;
    const promise = new Promise((resolve) => { resolveIt = resolve });
    const result = limiter.next()
    assert(isPromise(result))
    resolveIt()
    process.nextTick(async () => await result)
  })

})
