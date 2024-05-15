import { possessive } from '@/utils/shared/possessive'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { withOrdinalSuffix } from '@/utils/web/withOrdinalSuffix'

export function getDefaultText({
  location,
  firstName,
  lastName,
}: {
  dtsiSlugs: string[]
  location?: {
    districtNumber: number
    stateCode: string
  }
  firstName?: string
  lastName?: string
}) {
  const fullNameSignOff = firstName && lastName ? `\n\nRespectfully,\n${firstName} ${lastName}` : ''
  const maybeDistrictIntro = location
    ? `I am your constituent from ${possessive(US_STATE_CODE_TO_DISPLAY_NAME_MAP[location.stateCode as USStateCode])} ${withOrdinalSuffix(location.districtNumber)} district`
    : 'I am your constituent'

  return `Dear Representative,

${maybeDistrictIntro} and recently learned that the Financial Innovation and Technology for the 21st Century Act [FIT21 H.R. 4763] is being considered for a floor vote in the House.

I am asking you to vote YES on the FIT21 Act because it sets foundational rules for crypto that are pro-consumer and pro-job creation. It will protect 52 million Americans who own crypto, unlock the creation of millions of jobs in the U.S., and ensure America remains a global leader in technology.  That’s good for our economic and national security.  

We have been waiting patiently for years for our lawmakers to protect us, and strengthen America’s role in building the future of money and the internet.

I am excited the House is going to vote on FIT21, and I am asking you to vote YES for the Bill.${fullNameSignOff}`
}
