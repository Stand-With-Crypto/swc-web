import { possessive } from '@/utils/shared/possessive'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

export interface GetTextProps {
  location?: {
    districtNumber: number
    stateCode: string
  }
  firstName?: string
  lastName?: string
  dtsiLastName?: string
}

export function getConstituentIntroduction(location?: GetTextProps['location']) {
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

function getDTSILastName(dtsiLastName?: string) {
  if (!dtsiLastName || typeof dtsiLastName !== 'string') return ''

  return ' ' + dtsiLastName
}

export function getRepIntro({ dtsiLastName }: Pick<GetTextProps, 'dtsiLastName'>) {
  return `Dear Representative${getDTSILastName(dtsiLastName)},`
}
