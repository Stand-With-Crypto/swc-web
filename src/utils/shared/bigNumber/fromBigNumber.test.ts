import { describe, expect, it } from '@jest/globals'
import { BigNumber } from 'ethers'

import { fromBigNumber } from './fromBigNumber'

describe('utils/bigNumber/fromBigNumber', () => {
  it('should throw an error when x is undefined', () => {
    expect(() => fromBigNumber(undefined as any)).toThrow('Input must not be undefined')
  })

  it.each([-1729, 0, 78, 1729])(
    'should throw an error if the decimals are out of bounds - %p',
    input => {
      expect(() => fromBigNumber(BigNumber.from('3141592653589793238'), input)).toThrow(
        'Decimals must be between 1 and 77',
      )
    },
  )

  it.each([
    ['10', '1'],
    ['28', '2.8'],
    ['31', '3.1'],
    [
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      '11579208923731619542357098500868790785326998466564056403945758400791312963993.5',
    ],
  ])('should work with the lower boundary of decimal places for %p', (input, expected) => {
    expect(fromBigNumber(BigNumber.from(input), 1)).toEqual(expected)
  })

  it.each([
    ['100000000000000000000000000000000000000000000000000000000000000000000000000000', '1'],
    ['280000000000000000000000000000000000000000000000000000000000000000000000000000', '2.8'],
    ['310000000000000000000000000000000000000000000000000000000000000000000000000000', '3.1'],
    [
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      '1.15792089237316195423570985008687907853269984665640564039457584007913129639935',
    ],
  ])('should work with the upper boundary of decimal places for %p', (input, expected) => {
    expect(fromBigNumber(BigNumber.from(input), 77)).toEqual(expected)
  })
})
