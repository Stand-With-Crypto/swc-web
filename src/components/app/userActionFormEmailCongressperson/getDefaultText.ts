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

export function getDefaultText({
  location,
  firstName,
  lastName,
}: GetTextProps & {
  dtsiSlugs: string[]
}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const maybeDistrictIntro = getConstituentIntroduction(location)

  return `Dear Representative,

${maybeDistrictIntro} and recently learned that the Financial Innovation and Technology for the 21st Century Act [FIT21 H.R. 4763] is being considered for a floor vote in the House.

I am asking you to vote YES on the FIT21 Act because it sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto, unlock the creation of millions of jobs in the U.S., and ensure America remains a global leader in technology. That’s good for our economic and national security.

We have been waiting patiently for years for our lawmakers to protect us, and strengthen America’s role in building the future of money and the internet.

I am excited the House is going to vote on FIT21, and I am asking you to vote YES on the Act.${fullNameSignOff}`
}

export function getFIT21FollowUpText({
  billVote,
  location,
  firstName,
  lastName,
}: GetTextProps & {
  billVote: BillVoteResult
}) {
  const fullNameSignOff = getFullNameSignOff({ firstName, lastName })
  const intro = getConstituentIntroduction(location)

  if (billVote === 'VOTED_FOR') {
    return `Dear Representative,\n\n${intro} and wanted to thank you for your recent vote on the bipartisan Financial Innovation and Techno≈logy for the 21st Century Act [FIT21 H.R. 4763].\n\nAs you know, FIT21 sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto, unlock the creation of millions of jobs in the U.S., and ensure America remains a global leader in technology. That’s good for our economic and national security.\n\nAmerican crypto owners have been waiting patiently for years for our lawmakers to protect consumers and strengthen America’s role in building the future of money and the internet.\n\nI am glad that the House has passed FIT21, and I am grateful for your vote in favor. I hope you will encourage your colleagues in the Senate to take up the bill and pass it as well.${fullNameSignOff}`
  }

  return `TODO: VOTED AGAINST or DIDNT VOTE`
}
