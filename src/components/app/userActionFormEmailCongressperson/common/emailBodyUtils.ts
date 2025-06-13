import { z } from 'zod'

import { possessive } from '@/utils/shared/possessive'
import { getCAProvinceOrTerritoryNameFromCode } from '@/utils/shared/stateMappings/caProvinceUtils'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'
import { zodAddress } from '@/validation/fields/zodAddress'

export interface GetTextProps {
  location?: {
    districtNumber: number
    stateCode: string
  }
  firstName?: string
  lastName?: string
  dtsiLastName?: string
}

function getConstituentIntroduction(location?: GetTextProps['location']) {
  return location
    ? `I am your constituent from ${possessive(US_STATE_CODE_TO_DISPLAY_NAME_MAP[location.stateCode as USStateCode])} ${withOrdinalSuffix(location.districtNumber)} district`
    : 'I am your constituent'
}

export function getFullNameSignOff({
  firstName,
  lastName,
}: Pick<GetTextProps, 'firstName' | 'lastName'>) {
  return firstName && lastName ? `\n\nSincerely,\n${firstName} ${lastName}` : ''
}

export function getConstituentLocationSignOff(address?: z.infer<typeof zodAddress> | null) {
  if (!address) return ''
  const provinceOrTerritoryName = getCAProvinceOrTerritoryNameFromCode(
    address.administrativeAreaLevel1,
  )
  if (!provinceOrTerritoryName || !address.locality) return ''
  return `\n${address.locality}, ${provinceOrTerritoryName}`
}

function getDTSILastName(dtsiLastName?: string) {
  if (!dtsiLastName || typeof dtsiLastName !== 'string') return ''

  return ' ' + dtsiLastName
}

export function getRepIntro({ dtsiLastName }: Pick<GetTextProps, 'dtsiLastName'>) {
  return `Dear Representative${getDTSILastName(dtsiLastName)},`
}

export function getDefaultEmailBodyText({
  location,
  firstName,
  lastName,
  dtsiLastName,
}: GetTextProps = {}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const maybeDistrictIntro = getConstituentIntroduction(location)

  return `${getRepIntro({ dtsiLastName })}\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nLike the other 52 million Americans who own crypto, I know that this technology can unlock the creation of millions of jobs in the U.S. and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in America, and we need members of Congress like you to champion this powerful technology so that it can reach its full potential. If crypto doesn’t succeed in America, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Congress.${fullNameSignOff}`
}
