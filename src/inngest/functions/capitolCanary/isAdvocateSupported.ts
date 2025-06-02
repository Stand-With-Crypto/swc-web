import {
  CAPITOL_CANARY_SUPPORTED_COUNTRY_CODES,
  CAPITOL_CANARY_TEST_ADVOCATE_IDS,
} from './constants'

export function isAdvocateSupported({
  advocateId,
  countryCode,
}: {
  advocateId?: number | null
  countryCode: string
}): boolean {
  const isTestAdvocate = advocateId && CAPITOL_CANARY_TEST_ADVOCATE_IDS.includes(advocateId)

  return !isTestAdvocate && CAPITOL_CANARY_SUPPORTED_COUNTRY_CODES.includes(countryCode)
}
