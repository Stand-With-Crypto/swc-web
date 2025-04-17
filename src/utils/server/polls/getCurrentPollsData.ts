'use server'

import { UserActionType } from '@prisma/client'

import { getUserActionCTAsByCountry } from '@/components/app/userActionGridCTAs/constants/ctas'
import { getPollsResultsData, PollResultsDataResponse } from '@/data/polls/getPollsData'
import { getPolls } from '@/utils/server/builder/models/data/polls'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SWCPoll } from '@/utils/shared/zod/getSWCPolls'

interface GetCurrentPollsArgs {
  countryCode: SupportedCountryCodes
}

interface PollsResponse {
  activePolls: SWCPoll[] | null
  inactivePolls: SWCPoll[] | null
  initialPollsResultsData: Record<string, PollResultsDataResponse>
}

export async function getCurrentPollsData({
  countryCode,
}: GetCurrentPollsArgs): Promise<PollsResponse> {
  const [builderIoPolls, initialPollsResultsData] = await Promise.all([
    getPolls({ countryCode }),
    getPollsResultsData({ countryCode }),
  ])

  const ctas = getUserActionCTAsByCountry(countryCode)
  const pollCampaigns = ctas[UserActionType.POLL].campaigns

  const activePolls: SWCPoll[] = []
  const inactivePolls: SWCPoll[] = []

  pollCampaigns.forEach(campaign => {
    const matchingPoll = builderIoPolls?.find(poll => poll.id === campaign.campaignName)

    if (matchingPoll) {
      if (campaign.isCampaignActive) {
        activePolls.push(matchingPoll)
      } else {
        inactivePolls.push(matchingPoll)
      }
    }
  })

  return {
    activePolls: activePolls.length ? activePolls : null,
    inactivePolls: inactivePolls.length ? inactivePolls : null,
    initialPollsResultsData,
  }
}
