import { describe, expect, it } from '@jest/globals'
import { uniq } from 'lodash-es'

import { normalizePhoneNumber } from '@/utils/shared/phoneNumber'
import {
  DEFAULT_SUPPORTED_COUNTRY_CODE,
  ORDERED_SUPPORTED_COUNTRIES,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'

const TEST_PHONE_NUMBERS: Record<SupportedCountryCodes, string[]> = {
  [SupportedCountryCodes.US]: [
    '222 888 3333',
    '(222) 888 3333',
    '12228883333',
    '1 222 888 3333',
    '1 (222) 888 3333',
    '2228883333',
    '+1 222 888 3333',
  ],
  [SupportedCountryCodes.CA]: [
    '222 888 3333',
    '(222) 888-3333',
    '12228883333',
    '1 222 888 3333',
    '1 (222) 888 3333',
    '2228883333',
    '+1 222 888-3333',
  ],
  [SupportedCountryCodes.GB]: [
    '+44 117 2345678',
    '+44 117 234 5678',
    '(117) 234 5678',
    '44 117 234-5678',
    '44 (117) 234 5678',
    '+44117 2345678',
    '1172345678',
    '441172345678',
  ],
  [SupportedCountryCodes.AU]: [
    '+61 421 345678',
    '+61 421 345-678',
    '(421) 345 678',
    '61 421 345 678',
    '61 (421) 345 678',
    '+61421 345678',
    '421345678',
    '61421345678',
  ],
}

const EXPECTED_PHONE_NUMBERS: Record<SupportedCountryCodes, string[]> = {
  [SupportedCountryCodes.US]: ['+12228883333'],
  [SupportedCountryCodes.CA]: ['+12228883333'],
  [SupportedCountryCodes.GB]: ['+441172345678'],
  [SupportedCountryCodes.AU]: ['+61421345678'],
}

const NOT_SUPPORTED_PHONE_NUMBERS = ['+55 11 99999-9999', '+5511999999999', '+55(11)999999999']

describe('utils/normalizePhoneNumber', () => {
  it.each(ORDERED_SUPPORTED_COUNTRIES)(
    'Correctly parses phone number strings for %s',
    countryCode => {
      expect(
        uniq(
          TEST_PHONE_NUMBERS[countryCode].map(phoneNumber =>
            normalizePhoneNumber(phoneNumber, countryCode),
          ),
        ),
      ).toEqual(EXPECTED_PHONE_NUMBERS[countryCode])
    },
  )

  it('Correctly parses phone number strings without country code', () => {
    expect(
      uniq(
        TEST_PHONE_NUMBERS[DEFAULT_SUPPORTED_COUNTRY_CODE].map(phoneNumber =>
          normalizePhoneNumber(phoneNumber),
        ),
      ),
    ).toEqual(EXPECTED_PHONE_NUMBERS[DEFAULT_SUPPORTED_COUNTRY_CODE])
  })

  it('Returns the original phone number for unsupported countries', () => {
    expect(
      uniq(NOT_SUPPORTED_PHONE_NUMBERS.map(phoneNumber => normalizePhoneNumber(phoneNumber))),
    ).toEqual(['+5511999999999'])
  })
})
