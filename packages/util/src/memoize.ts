import {mapApplyMaxSize} from './map-apply-max-size.js'

/**
 * A memoization wrapper with ttl expiration for cache hits.
 *
 * What: Returns the last response from a function if called again with same props
 * before ttl interval has passed.
 *
 * Compared to other memoization algs (fast-memoize, nano-memoize), is much simpler,
 * shorter, easier to fork/enhance while less perfect and slower for primitive args.
 */
export const memoize: Memoize = <F extends Fnc>(fn: F, ttl = 1000) => {
  const throttled = (...props: any) => {
    const cacheKey = JSON.stringify({
      signature: `${fn.name}::${fn.toString().slice(0, 10)}`,
      props,
    })
    let {expires = 0, returnValue} = memoize.cache.get(cacheKey) || {
      expires: 0,
      returnValue: null,
    }
    const now = Date.now()
    if (now > expires) {
      expires = now + ttl
      returnValue = fn(...props)
      memoize.cache.set(cacheKey, {expires, returnValue})
    }
    return returnValue
  }
  return throttled as F
}
memoize.cache = new Map<string, {expires: number; returnValue: any}>()
mapApplyMaxSize(memoize.cache, 200)

type Fnc = (...args: any) => any
type Memoize = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  <F extends Fnc>(fn: F, ttl: number): F
  cache: Map<string, {returnValue: any; expires: number}>
}
