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

  return `To my elected representative,\n\n${props?.firstName ? `My name is ${props.firstName}, and ` : ''}I am one of your constituents. I’m writing to congratulate you on your recent swearing in to the 119th Congress and wish you well as you work to advance our community’s interests in Washington.\n\nI am one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. I am hopeful that you will keep my views – and those of my fellow crypto owners’ – in mind as you work and vote this Congress.\n\nAmerican crypto owners are a diverse and bipartisan group who are looking to Washington to provide clear rules of the road around crypto, including consumer protection, “market structure” legislation, stablecoin legislation, exploring the establishment of a national strategic reserve of cryptocurrency, and clarity related to tax treatment.\n\nWith the right rules from Congress, crypto can thrive in our country, creating jobs and fostering innovation along the way. This Congress is the most pro-crypto in history, and American crypto voters are excited to see what you deliver.\n\nThank you for taking the time to read my letter. ${isUserInfoProvided ? fullNameSignOff : ''}${props?.address ? `\n${props.address}` : ''}`
}
