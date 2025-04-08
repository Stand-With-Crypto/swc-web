import { describe, expect, it } from '@jest/globals'
import { uniq } from 'lodash-es'

import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const US_PHONE_NUMBERS = [
  '222 888 3333',
  '(222) 888-3333',
  '12228883333',
  '1 222 888 3333',
  '1 (222) 888 3333',
  '2228883333',
  '+1 222 888-3333',
]

const CA_PHONE_NUMBERS = [...US_PHONE_NUMBERS]

const UK_PHONE_NUMBERS = [
  '+44 117 2345678',
  '+44 117 234 5678',
  '(117) 234 5678',
  '44 117 234-5678',
  '44 (117) 234 5678',
  '+44117 2345678',
  '1172345678',
  '441172345678',
]

const AU_PHONE_NUMBERS = [
  '+61 421 345678',
  '+61 421 345-678',
  '(421) 345 678',
  '61 421 345 678',
  '61 (421) 345 678',
  '+61421 345678',
  '421345678',
  '61421345678',
]

const NOT_SUPPORTED_PHONE_NUMBERS = [
  '+55 11 99999-9999',
  '55 (11) 99999 9999',
  '+5511999999999',
  '55 11 99999-9999',
  '5511999999999',
  '+55(11)999999999',
]

describe('utils/normalizePhoneNumber', () => {
  it('Correctly parses phone number strings for the US', () => {
    expect(
      uniq(
        US_PHONE_NUMBERS.map(phoneNumber =>
          normalizePhoneNumber(phoneNumber, SupportedCountryCodes.US),
        ),
      ),
    ).toEqual(['+12228883333'])
  })

  it('Correctly parses phone number strings for the CA', () => {
    expect(
      uniq(
        CA_PHONE_NUMBERS.map(phoneNumber =>
          normalizePhoneNumber(phoneNumber, SupportedCountryCodes.CA),
        ),
      ),
    ).toEqual(['+12228883333'])
  })

  it('Correctly parses phone number strings for the UK', () => {
    expect(
      uniq(
        UK_PHONE_NUMBERS.map(phoneNumber =>
          normalizePhoneNumber(phoneNumber, SupportedCountryCodes.GB),
        ),
      ),
    ).toEqual(['+441172345678'])
  })

  it('Correctly parses phone number strings for the AU', () => {
    expect(
      uniq(
        AU_PHONE_NUMBERS.map(phoneNumber =>
          normalizePhoneNumber(phoneNumber, SupportedCountryCodes.AU),
        ),
      ),
    ).toEqual(['+61421345678'])
  })

  it('Returns the original phone number for unsupported countries', () => {
    expect(
      uniq(
        NOT_SUPPORTED_PHONE_NUMBERS.map(phoneNumber =>
          normalizePhoneNumber(phoneNumber, 'BR' as SupportedCountryCodes),
        ),
      ),
    ).toEqual(['+5511999999999'])
  })
})
