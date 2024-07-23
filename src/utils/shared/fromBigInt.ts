import { FixedNumber } from 'ethers'

/**
 * Convert a bigint with a custom number of decimals to a stringified fixed-point number.
 */
export function fromBigInt(x: bigint, decimals: number = 18): string {
  if (x === undefined) {
    throw new Error('Input must not be undefined')
  }

  if (decimals < 1 || decimals > 77) {
    throw new Error('Decimals must be between 1 and 77')
  }

  const valueString: string = x.toString()

  const result: string = FixedNumber.from(valueString, `fixed256x${decimals}`).toString()
  return result.replace(/\.0$/, '')
}
