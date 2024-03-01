import { z } from 'zod'

import { zodVerifiedSWCPartnersUserAddress } from '@/data/verifiedSWCPartners/userActionOptIn'

export function getFormattedDescription(
  address: z.infer<typeof zodVerifiedSWCPartnersUserAddress>,
) {
  let result = ''
  const addElementToAddress = function (element: string) {
    if (!element) {
      return
    }
    if (result.length > 0) {
      result += ' '
    }
    result += element
  }

  if (address.route) {
    addElementToAddress(address.streetNumber)
    addElementToAddress(address.route)
    addElementToAddress(address.subpremise)
    result += ','
  }

  addElementToAddress(address.locality)
  addElementToAddress(address.administrativeAreaLevel1)
  if (address.locality || address.administrativeAreaLevel1) {
    result += ','
  }
  addElementToAddress(address.postalCode)
  if (address.postalCode && address.postalCodeSuffix) {
    result += `-${address.postalCodeSuffix}`
  }
  addElementToAddress(address.countryCode)
  return result
}
