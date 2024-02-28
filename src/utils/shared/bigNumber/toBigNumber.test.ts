import { expect, it } from '@jest/globals'

import { toBigNumber } from './toBigNumber'

describe('utils/bigNumber/toBigNumber', () => {
  it.each([undefined, null, true, 2.71, Math.PI, { x: 100 }, () => {}])(
    'when %p is not a string',
    x => {
      expect(() => toBigNumber(x as any)).toThrow('Input must be a string')
    },
  )

  it.each(['qwerty', 'Bonjour le Monde', 'a0b0z0d0', '0xcafe', 'áèâéèê'])(
    'should throw on not base 10 numbers',
    x => {
      expect(() => toBigNumber(x)).toThrow('Unknown format for fixed-point number: ' + x)
    },
  )

  it.each([-1729, 0, 78, 1729])('should throw on out of bounds decimals', decimals => {
    const x: string = '3.141592653589793238'
    expect(() => toBigNumber(x, decimals)).toThrow('Decimals must be between 1 and 77')
  })

  it.each([
    ['1', '10'],
    ['2.8', '28'],
    ['3.1', '31'],
    [
      '11579208923731619542357098500868790785326998466564056403945758400791312963993.5',
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ],
  ])(`takes %p and returns %p`, (x, expected) => {
    expect(String(toBigNumber(x, 1))).toEqual(expected)
  })

  it.each([
    ['1', '100000000000000000000000000000000000000000000000000000000000000000000000000000'],
    ['2.8', '280000000000000000000000000000000000000000000000000000000000000000000000000000'],
    ['3.1', '310000000000000000000000000000000000000000000000000000000000000000000000000000'],
    [
      '1.15792089237316195423570985008687907853269984665640564039457584007913129639935',
      '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    ],
  ])('should respect the upper boundary of decimal places', (x, expected) => {
    expect(String(toBigNumber(x, 77))).toEqual(expected)
  })

  it.each([
    '3860393555824785230250785487392862718135031063639377380058239.75498055625639',
    '1641859000171773711896013123523298990385936318426437089678010964091794.294085164534340909',
    '6579166703548843398264284621832829277269325500191914304280053707339887173863112402178486913.1782903',
  ])('takes %p and throws an error', x => {
    expect(() => toBigNumber(x)).toThrow('Unknown format for fixed-point number: ' + x)
  })
})
