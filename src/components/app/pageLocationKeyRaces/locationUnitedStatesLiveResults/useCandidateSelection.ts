'use client'

import { useMemo } from 'react'

import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { CandidatesWithVote, RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'

export const useInitialCandidateSelection = (candidates: DTSI_Candidate[]) => {
  return useMemo(() => {
    let recommended: DTSI_Candidate | undefined
    let democrat: DTSI_Candidate | undefined
    let republican: DTSI_Candidate | undefined
    let other: DTSI_Candidate | undefined

    for (const candidate of candidates) {
      if (candidate.isRecommended && !recommended) {
        recommended = candidate
      }

      switch (candidate.politicalAffiliationCategory) {
        case DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT:
          if (!democrat) democrat = candidate
          break
        case DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN:
          if (!republican) republican = candidate
          break
        default:
          if (!other) other = candidate
      }

      if (recommended && democrat && republican) break
    }

    const firstChoice = recommended || democrat || republican || other
    let secondChoice: DTSI_Candidate | undefined

    if (firstChoice) {
      secondChoice =
        democrat && democrat.id !== firstChoice.id
          ? democrat
          : republican && republican.id !== firstChoice.id
            ? republican
            : other && other.id !== firstChoice.id
              ? other
              : undefined
    }

    return [firstChoice, secondChoice].filter((c): c is DTSI_Candidate => !!c)
  }, [candidates])
}

export type DTSI_DDHQ_Candidate = (Omit<DTSI_Candidate, 'id'> & CandidatesWithVote) | null

export const useLiveCandidateSelection = (
  dtsiCandidates: DTSI_Candidate[],
  liveResultData: RacesVotingDataResponse | null,
): DTSI_DDHQ_Candidate[] => {
  const fallback = useInitialCandidateSelection(dtsiCandidates)

  if (!liveResultData) return []

  const totalCastVotes = liveResultData.candidatesWithVotes.reduce(
    (acc, candidate) => acc + candidate.votes,
    0,
  )
  const isZeroed = totalCastVotes < 100

  const sortedCandidates = liveResultData?.candidatesWithVotes
    ?.sort((a, b) => b.votes - a.votes)
    .slice(0, 2)

  if (!sortedCandidates || !sortedCandidates.length) return []

  let shouldFallback = isZeroed
  const candidatesToShow = sortedCandidates.map(ddhqCandidate => {
    const matchedCandidate = dtsiCandidates.find(dtsiCandidate =>
      getPoliticianFindMatch(dtsiCandidate, ddhqCandidate),
    )

    if (!matchedCandidate) {
      shouldFallback = true
      return null
    }

    return {
      ...matchedCandidate,
      ...ddhqCandidate,
    }
  })

  if (shouldFallback) {
    const enhancedFallback = fallback.map(dtsiCandidate => {
      const matchedCandidate = liveResultData.candidatesWithVotes.find(ddhqCandidate =>
        getPoliticianFindMatch(dtsiCandidate, ddhqCandidate),
      )
      if (!matchedCandidate) return null

      return { ...dtsiCandidate, ...matchedCandidate }
    })

    return enhancedFallback.filter(c => !!c)
  }

  return candidatesToShow
}
