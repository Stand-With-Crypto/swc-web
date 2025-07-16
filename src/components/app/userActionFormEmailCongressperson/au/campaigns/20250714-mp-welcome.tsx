import {
  getFullNameSignOff,
  getRepIntro,
  GetTextProps,
} from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleGroupCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { DTSIPeopleByElectoralZoneQueryResult } from '@/data/dtsi/queries/queryDTSIPeopleByElectoralZone'
import { AUUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/au/auUserActionCampaigns'
import {
  filterDTSIPeopleByAUPoliticalCategory,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory/au'

import type { CampaignMetadata } from './types'

const CAMPAIGN_NAME = AUUserActionEmailCampaignName.WELCOME_MP_BACK_TO_PARLIAMENT_2025

export const EMAIL_FLOW_POLITICIANS_CATEGORY: YourPoliticianCategory = 'house-of-reps'

const DTSI_DANIEL_MULINO = {
  id: '1ffd9148-3b96-414d-9a7a-58321dfbb3b7',
  slug: 'daniel---mulino---au',
  firstName: 'Daniel',
  lastName: 'Mulino',
  firstNickname: '',
  nameSuffix: '',
  politicalAffiliation: 'Labor',
  politicalAffiliationCategory: DTSI_PersonPoliticalAffiliationCategory.LABOR,
  computedStanceScore: null,
  computedSumStanceScoreWeight: null,
  manuallyOverriddenStanceScore: null,
  profilePictureUrl:
    'https://db0prh5pvbqwd.cloudfront.net/all/images/d41053b6-ddac-4942-8dd4-f2cdd36ff2fd.jpg',
  profilePictureUrlDimensions: {
    type: 'jpg',
    width: 150,
    height: 239,
  },
  promotedPositioning: null,
  stanceCount: 0,
  primaryRole: {
    dateEnd: null,
    dateStart: '2025-07-09T00:00:00.000Z',
    id: '409f079b-2700-4266-9504-cc4e60efd681',
    primaryCity: '',
    primaryCountryCode: 'AU',
    primaryDistrict: 'Fraser',
    primaryState: 'VIC',
    roleCategory: DTSI_PersonRoleCategory.CONGRESS,
    status: DTSI_PersonRoleStatus.HELD,
    title: '',
    group: {
      id: '9b39cf2b-7361-4221-bd7f-e470e12a0835',
      category: DTSI_PersonRoleGroupCategory.CONGRESS,
      groupInstance: '48',
    },
  },
  twitterAccounts: [],
}

/**
 * Per marketing team request, returning Daniel Mulino as fallback if no other local MP is found for the advocate address.
 */
export function filterDTSIPeopleByAUPoliticalCategoryWithFallback(
  category: YourPoliticianCategory,
) {
  const baseFilter = filterDTSIPeopleByAUPoliticalCategory(category)
  return (people: DTSIPeopleByElectoralZoneQueryResult): DTSIPeopleByElectoralZoneQueryResult => {
    const filtered = baseFilter(people)
    if (filtered.length > 0) {
      return filtered
    }
    return [DTSI_DANIEL_MULINO]
  }
}

function getEmailBodyText(props?: GetTextProps & { address?: string }) {
  const { firstName, lastName, dtsiLastName } = props || {}

  const fullNameSignOff = getFullNameSignOff({
    firstName: props?.firstName,
    lastName: props?.lastName,
  })

  const repIntro = getRepIntro({ dtsiLastName: dtsiLastName })
  const advocateName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const maybeAdvocateIntro = advocateName ? `My name is ${advocateName}, and ` : ''

  return `${repIntro}
${maybeAdvocateIntro} I am one of your constituents. I'm writing to congratulate you on your recent election to Parliament and wish you well as you work to advance our community's interests in Canberra.

As a voter in your electorate, and one of more than 4 million Australian's that own, build, or develop crypto, digital assets and blockchain technology I urge you to support and prioritise digital asset and stablecoin reforms. While often associated with finance, this technology offers far broader benefits, from secure digital identity to more efficient public services. It's a tool that can help boost productivity, support entrepreneurs, and strengthen consumer trust.

This technology offers significant potential for not only Australia, but also our electorate in terms of jobs, economic growth and even financial inclusivity.

Other countries are already moving to integrate blockchain into their innovation plans.
Australia has the talent and values to lead in this space if we take thoughtful steps forward.

I support candidates who prioritise responsible crypto policies and encourage you to champion this transformative industry.

Thank you for your consideration.${fullNameSignOff}`
}

export const campaignMetadata: CampaignMetadata = {
  campaignName: CAMPAIGN_NAME,
  dialogTitle: 'Email your MP',
  dialogSubtitle: 'Advocate for crypto reforms',
  politicianCategory: EMAIL_FLOW_POLITICIANS_CATEGORY,
  subject: 'Support Blockchain as a Priority for Australia’s Productivity Agenda',
  getEmailBodyText,
}
