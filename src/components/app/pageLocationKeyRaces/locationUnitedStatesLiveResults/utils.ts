import * as Sentry from '@sentry/nextjs'
import { isBefore, startOfDay } from 'date-fns'
import { isNil } from 'lodash-es'

import { RaceStatus } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import {
  CandidatesWithVote,
  CongressDataResponse,
  PresidentialDataWithVotingResponse,
  RacesVotingDataResponse,
} from '@/data/aggregations/decisionDesk/types'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { dtsiPersonPoliticalAffiliationCategoryAbbreviation } from '@/utils/dtsi/dtsiPersonUtils'
import { twNoop } from '@/utils/web/cn'

export const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-[#5b616e]')
  }
  if (score >= 90) {
    return twNoop('bg-green-700')
  }
  if (score >= 70) {
    return twNoop('bg-[#7b8508]')
  }
  if (score >= 50) {
    return twNoop('bg-yellow-600')
  }

  return twNoop('bg-red-700')
}

export const getPoliticalCategoryAbbr = (category: DTSI_PersonPoliticalAffiliationCategory) => {
  if (!category) return ''
  return dtsiPersonPoliticalAffiliationCategoryAbbreviation(category) || ''
}

export const getVotePercentage = (
  candidate: CandidatesWithVote | null,
  raceData: RacesVotingDataResponse | null,
) => {
  if (!candidate) return 0

  const totalVotes = Math.max(
    candidate?.estimatedVotes?.estimatedVotesMid || 0,
    raceData?.totalVotes || 0,
  )
  if (isNil(totalVotes)) return 0

  return candidate.votes ? +((candidate.votes / totalVotes) * 100).toFixed(2) : 0
}

export const getRaceStatus = (
  raceData: RacesVotingDataResponse | RacesVotingDataResponse[] | null | undefined,
): RaceStatus => {
  if (!raceData) return 'unknown'

  let calledRace: boolean = false
  if (Array.isArray(raceData)) {
    if (raceData.length === 0) {
      return 'unknown'
    }

    calledRace = raceData.every(race => race.hasCalledCandidate || race.advanceCandidates)
  } else {
    calledRace = raceData.hasCalledCandidate
  }

  if (calledRace) {
    return 'called'
  }

  if (!Array.isArray(raceData) && raceData.advanceCandidates) {
    return 'runoff'
  }

  let isLive: boolean = false
  if (Array.isArray(raceData)) {
    isLive = raceData.some(race => +race.totalVotes > 0)
  } else {
    isLive = +raceData.totalVotes > 0
  }
  if (isLive) {
    return 'live'
  }

  const now = new Date()
  let raceDate: Date
  if (Array.isArray(raceData)) {
    raceDate = new Date(raceData?.[0].raceDate || '2024-11-05')
  } else {
    raceDate = new Date(raceData?.raceDate || '2024-11-05')
  }
  if (isBefore(startOfDay(now), startOfDay(raceDate))) {
    return 'not-started'
  }

  return 'live'
}

export const getOpacity = (
  candidate: CandidatesWithVote | null,
  raceData: RacesVotingDataResponse | null,
) => {
  if (!candidate) return 'opacity-100'
  if (candidate.elected) return 'opacity-100'

  const calledCandidate = raceData?.calledCandidate
  if (!calledCandidate) return 'opacity-100'

  return calledCandidate.id === candidate.id ? 'opacity-100' : 'opacity-50'
}

export const getCongressLiveResultOverview = (
  data: Pick<CongressDataResponse, 'candidatesWithVotes'> | null | undefined,
  stateCode?: string,
) => {
  if (!data?.candidatesWithVotes?.length) {
    return { proCryptoCandidatesElected: [], antiCryptoCandidatesElected: [] }
  }

  return data.candidatesWithVotes.reduce(
    (acc, candidate) => {
      if (!candidate?.dtsiData) {
        Sentry.captureMessage('No DTSI data for candidate in getCongressLiveResultOverview', {
          extra: { candidate },
          tags: { domain: 'liveResult' },
        })
        return acc
      }
      if (!candidate.elected) return acc
      if (stateCode && candidate.dtsiData.primaryRole?.primaryState !== stateCode) return acc

      const stanceScore =
        candidate.dtsiData.manuallyOverriddenStanceScore || candidate.dtsiData.computedStanceScore
      if (isNil(stanceScore)) return acc

      if (stanceScore > 50) {
        acc.proCryptoCandidatesElected.push(candidate)
      } else {
        acc.antiCryptoCandidatesElected.push(candidate)
      }
      return acc
    },
    { proCryptoCandidatesElected: [], antiCryptoCandidatesElected: [] } as {
      proCryptoCandidatesElected: CongressDataResponse['candidatesWithVotes']
      antiCryptoCandidatesElected: CongressDataResponse['candidatesWithVotes']
    },
  )
}

export function isPresidentialData(
  data: RacesVotingDataResponse[] | PresidentialDataWithVotingResponse[] | null,
): data is PresidentialDataWithVotingResponse[] {
  return 'votingData' in (data?.[0] || {})
}

export const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}
