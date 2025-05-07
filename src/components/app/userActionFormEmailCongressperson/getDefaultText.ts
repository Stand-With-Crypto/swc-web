import { possessive } from '@/utils/shared/possessive'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

interface GetTextProps {
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

function getFullNameSignOff({ firstName, lastName }: Pick<GetTextProps, 'firstName' | 'lastName'>) {
  return firstName && lastName ? `\n\nSincerely,\n${firstName} ${lastName}` : ''
}

function getDTSILastName(dtsiLastName?: string) {
  if (!dtsiLastName || typeof dtsiLastName !== 'string') return ''

  return ' ' + dtsiLastName
}

export function getDefaultText({ location, firstName, lastName, dtsiLastName }: GetTextProps = {}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const maybeDistrictIntro = getConstituentIntroduction(location)

  return `Dear Representative${getDTSILastName(dtsiLastName)},\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nLike the other 52 million Americans who own crypto, I know that this technology can unlock the creation of millions of jobs in the U.S. and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in America, and we need members of Congress like you to champion this powerful technology so that it can reach its full potential. If crypto doesn’t succeed in America, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Congress.${fullNameSignOff}`
}

export function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  const isUserInfoProvided = props?.firstName && props?.lastName

  return `On behalf of the entire crypto community, I am urging you to vote YES on the motion to proceed to consideration of the Guiding and Establishing National Innovation for U.S. Stablecoins (GENIUS) Act.\n\nYour support is instrumental to opening debate and allowing the legislative process to unfold so the bill can be updated with key provisions that will allow the U.S. to realize the full potential of stablecoins. We must foster a regulatory environment that encourages the growth of the crypto industry while ensuring the protection of consumers like myself. The GENIUS Act has the potential to provide clear guidelines and standards for stablecoin regulation, helping to enhance the efficiency of our financial system and maintain U.S. leadership in digital asset innovation\n\nIn the past, you’ve shown commitment to thoughtful and forward-looking legislation and your constituents like me are grateful. By opening debate on GENIUS, you have the opportunity to show this commitment once again.\n\nWhen you stand with crypto, you stand with millions of Americans across the country. Thank you.${isUserInfoProvided ? fullNameSignOff : ''}${props?.address && isUserInfoProvided ? `\n${props.address}` : ''}`
}
