import { capitalize } from 'lodash-es'

import { pluralize } from '@/utils/shared/pluralize'
import { possessive } from '@/utils/shared/possessive'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
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

function getDTSIPeopleLastNamesCombined(dtsiPeopleLastNames?: string[]) {
  if (
    !dtsiPeopleLastNames ||
    !Array.isArray(dtsiPeopleLastNames) ||
    !dtsiPeopleLastNames[0] ||
    !dtsiPeopleLastNames[1]
  ) {
    return ''
  }

  return capitalize(dtsiPeopleLastNames[0]) + ' and ' + capitalize(dtsiPeopleLastNames[1])
}

export function getDefaultText({ location, firstName, lastName, dtsiLastName }: GetTextProps = {}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const maybeDistrictIntro = getConstituentIntroduction(location)

  return `Dear Representative${getDTSILastName(dtsiLastName)},\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nLike the other 52 million Americans who own crypto, I know that this technology can unlock the creation of millions of jobs in the U.S. and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in America, and we need members of Congress like you to champion this powerful technology so that it can reach its full potential. If crypto doesn’t succeed in America, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Congress.${fullNameSignOff}`
}

export function getSECCommissionerText(props?: GetTextProps & { dtsiPeopleLastNames?: string[] }) {
  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  const dtsiLastNamesCombined = getDTSIPeopleLastNamesCombined(props?.dtsiPeopleLastNames)
  const isUserInfoProvided = props?.firstName && props?.lastName

  if (dtsiLastNamesCombined) {
    return `Dear ${pluralize({ count: props?.dtsiPeopleLastNames?.length ?? 0, singular: 'Senator' })} ${dtsiLastNamesCombined},\n\nI am one of your constituents and an advocate for crypto and its potential to unlock innovation, jobs, and American global leadership. I am concerned that the Senate is considering re-appointing the anti-crypto Securities and Exchange Commission Commissioner Caroline Crenshaw to her current post.\n\nCommissioner Crenshaw has been extremely anti-crypto in her time on the SEC, fighting against American crypto owners and innovators at every turn. She even voted against approving the now-popular Bitcoin ETF offerings, going further in opposition to crypto than even Chair Gary Gensler.\n\nI strongly oppose commissioner Crenshaw’s re-nomination to the SEC and urge you to oppose and vote against it. Thank you for your time and consideration.${isUserInfoProvided ? fullNameSignOff : ''}`
  }

  return `I am one of your constituents and an advocate for crypto and its potential to unlock innovation, jobs, and American global leadership. I am concerned that the Senate is considering re-appointing the anti-crypto Securities and Exchange Commission Commissioner Caroline Crenshaw to her current post.\n\nCommissioner Crenshaw has been extremely anti-crypto in her time on the SEC, fighting against American crypto owners and innovators at every turn. She even voted against approving the now-popular Bitcoin ETF offerings, going further in opposition to crypto than even Chair Gary Gensler.\n\nI strongly oppose commissioner Crenshaw’s re-nomination to the SEC and urge you to oppose and vote against it. Thank you for your time and consideration.${isUserInfoProvided ? fullNameSignOff : ''}`
}
