import { BillVoteResult } from '@/app/api/public/dtsi/bill-vote/[billId]/[slug]/route'
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
}

function getConstituentIntroduction(location?: GetTextProps['location']) {
  return location
    ? `I am your constituent from ${possessive(US_STATE_CODE_TO_DISPLAY_NAME_MAP[location.stateCode as USStateCode])} ${withOrdinalSuffix(location.districtNumber)} district`
    : 'I am your constituent'
}

function getFullNameSignOff({ firstName, lastName }: Pick<GetTextProps, 'firstName' | 'lastName'>) {
  return firstName && lastName ? `\n\nRespectfully,\n${firstName} ${lastName}` : ''
}

export function getDefaultText({ location, firstName, lastName }: GetTextProps = {}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const maybeDistrictIntro = getConstituentIntroduction(location)

  return `Dear Representative,\n\n${maybeDistrictIntro}, and I wanted to write to you and let you know that I care about crypto and blockchain technology.\n\nLike the other 52 million Americans who own crypto, I know that this technology can unlock the creation of millions of jobs in the U.S. and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nCrypto needs clear rules, regulations, and guidelines to thrive in America, and we need members of Congress like you to champion this powerful technology so that it can reach its full potential. If crypto doesn’t succeed in America, then jobs, innovation, and new technologies will be driven overseas and our country will miss out on the massive benefits.\n\nI hope that you will keep the views of pro-crypto constituents like myself in mind as you carry on your work in Congress.${fullNameSignOff}`
}

export function getFIT21FollowUpText({
  billVote,
  ...getTextProps
}: GetTextProps & {
  billVote: BillVoteResult
}) {
  const { location, firstName, lastName } = getTextProps
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const intro = getConstituentIntroduction(location)

  if (billVote === 'VOTED_FOR') {
    return `Dear Representative,\n\n${intro} and wanted to thank you for your recent vote on the bipartisan Financial Innovation and Technology for the 21st Century Act [FIT21 H.R. 4763].\n\nAs you know, FIT21 sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto, unlock the creation of millions of jobs in the U.S., and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nAmerican crypto owners have been waiting patiently for years for our lawmakers to protect consumers and strengthen America’s role in building the future of money and the internet.\n\nI am glad that the House has passed FIT21, and I am grateful for your vote in favor. I hope you will encourage your colleagues in the Senate to take up the bill and pass it as well.${fullNameSignOff}`
  }

  return getDefaultText(getTextProps)
}

export function getSubjectLine({ billVote }: { billVote: BillVoteResult }) {
  if (billVote === 'VOTED_FOR') {
    return 'Thank You - H.R 4763'
  }

  return 'I Support Crypto'
}
