/**
 * Runs a race between a promise and a timeout, resolving with the
 * first value. Runs this race for an array of promises.
 *
 * This allows promises to be resolved within a specified timeout,
 * defaulting to a fallback value if the timeout is reached first.
 *
 * @param promises - An array of promises to race against timeouts
 * @param timeoutTime - The timeout duration in milliseconds
 * @param defaultValueForTimeout - The value to resolve with if timeout occurs
 *
 * Example:
 *
 * ```
 * const promisesArray = [
      new Promise(resolve => setTimeout(() => resolve('1'), 100)),
      new Promise(resolve => setTimeout(() => resolve('2'), 900)),
      new Promise(resolve => setTimeout(() => resolve('3'), 300)),
    ]

    const result = await raceAll(promisesArray, 600, 'defaultValueWhenTimeoutisReached')
    // result will be equal to ['1', 'defaultValueWhenTimeoutisReached', '3']

 *
 * ```
*/
export async function raceAll<T>(
  promises: Promise<T>[],
  timeoutTime: number,
  defaultValueForTimeout: T | null = null,
) {
  return await Promise.all(
    promises.map(promise => {
      return Promise.race<T>([
        promise,
        new Promise<T>(resolve => {
          setTimeout(() => resolve(defaultValueForTimeout as T), timeoutTime)
        }),
      ])
    }),
  )
}
