import { expect, it } from '@jest/globals'

import { stringToEthereumAddress } from '@/utils/shared/stringToEthereumAddress'

describe('utils/stringToEthereumAddress', () => {
  it.each([
    ['0x52908400098527886E0F7030069857D2E4169EE7'],
    ['0x52908400098527886e0f7030069857d2e4169ee7'],
  ])('Address %p should return address %p', input => {
    expect(stringToEthereumAddress(input)).toEqual(input)
  })

  it.each([
    ['0x52908400098527886E0F7030069857D2E4169E7'],
    ['0y52908400098527886E0F7030069857D2E4169EE7'],
    ['x052908400098527886E0F7030069857D2E4169EE7'],
    ['0x52908400098527886E0F7030069857D2E4169EEE7'],
    ['0052908400098527886E0F7030069857D2E4169EE7'],
    [''],
    [';fhdjks'],
  ])('Invalid address %p should return null', input => {
    expect(stringToEthereumAddress(input)).toEqual(null)
  })
})
