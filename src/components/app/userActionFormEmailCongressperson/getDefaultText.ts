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

  return `${props?.firstName ? `My name is ${props.firstName}, ` : ''}I am your constituent and I am one of the tens of millions of Americans who own, build, or develop with cryptocurrencies and blockchain technology. I’m writing to ask you to vote “YES” S.J.Res.3 when it’s up on the Senate Floor this week.\n\nOn December 27, 2024, the Treasury Department released final reporting regulations for decentralized finance “DeFi” brokers. This rule is problematic and creates requirements for self-custodial wallet providers which could push the innovation offshore. The rules go beyond Congressional intent and reach further than existing requirements for traditional financial institutions.\n\nOn January 21, 2025, Senator Cruz introduced S.J.Res.3 invoking the Congressional Review Act which would overturn this problematic rule. We strongly encourage you to vote for it on the Senate floor.\n\nThis Administration and Congress are the most pro-crypto in history. Let's continue this progress and create American jobs by protecting our rights to self-custody.\n\nThank you for taking the time to read my letter.\n${isUserInfoProvided ? fullNameSignOff : ''}${props?.address ? `\n${props.address}` : ''}`
}
