'use client'

import { useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { convertDTSIStanceScoreToBgColorClass } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskPresidentialData } from '@/hooks/useApiDecisionDeskPresidentialData'
import { cn } from '@/utils/web/cn'

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: PresidentialDataWithVotingResponse[] | null
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = null } = props

  const candidateA = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Trump') || candidates?.[0],
    [candidates],
  )
  const candidateB = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Harris') || candidates?.[1],
    [candidates],
  )

  const {
    data: liveResultData,
    isLoading,
    isValidating,
  } = useApiDecisionDeskPresidentialData(initialRaceData)

  console.log('PRESIDENTIAL: ', {
    initialRaceData,
    liveResultData,
    isLoading,
    isValidating,
  })

  const ddhqCandidateA = useMemo(() => {
    if (!liveResultData) return null
    if (!candidateA) return null

    const candidate = liveResultData?.find(_candidate =>
      getPoliticianFindMatch(candidateA, _candidate.votingData),
    )

    if (!candidate) return null

    return candidate
  }, [candidateA, liveResultData])

  const ddhqCandidateB = useMemo(() => {
    if (!liveResultData) return null
    if (!candidateB) return null

    const candidate = liveResultData?.find(_candidate =>
      getPoliticianFindMatch(candidateB, _candidate.votingData),
    )

    if (!candidate) return null

    return {
      ...candidateB,
      ...candidate,
    }
  }, [candidateB, liveResultData])

  const canShowProgress = Boolean(liveResultData)

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex justify-between">
        <AvatarBox
          candidate={candidateA}
          electoralVotes={ddhqCandidateA?.votingData?.electoralVotes}
        />
        <AvatarBox
          candidate={candidateB}
          className="flex flex-col items-end text-right"
          electoralVotes={ddhqCandidateB?.votingData?.electoralVotes}
        />
      </div>

      <div className="flex">
        {canShowProgress ? (
          <>
            <Progress
              className="h-6 rounded-l-full rounded-r-none bg-[#23262B]"
              indicatorClassName={cn(
                'bg-none rounded-r-none',
                convertDTSIStanceScoreToBgColorClass(
                  candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
                ),
                getOpacity(candidateA, liveResultData),
              )}
              value={Math.min(+(ddhqCandidateA?.votingData?.percentage || 0)?.toFixed(2) * 2, 100)}
            />
            <Progress
              className="h-6 rounded-l-none rounded-r-full border-l bg-[#23262B]"
              indicatorClassName={cn(
                'bg-none rounded-l-none',
                convertDTSIStanceScoreToBgColorClass(
                  candidateB.manuallyOverriddenStanceScore || candidateB.computedStanceScore,
                ),
                getOpacity(candidateB, liveResultData),
              )}
              inverted
              value={Math.min(+(ddhqCandidateB?.votingData?.percentage || 0)?.toFixed(2) * 2, 100)}
            />
          </>
        ) : (
          <Skeleton className="h-6 w-full rounded-full" />
        )}
      </div>

      <div className="relative flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateA?.votingData?.percentage?.toFixed(2)}%</p>{' '}
          <span className="text-fontcolor-muted">{ddhqCandidateA?.votingData?.votes}</span>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateB?.votingData?.percentage?.toFixed(2)}%</p>{' '}
          <span className="text-fontcolor-muted">{ddhqCandidateB?.votingData?.votes}</span>
        </div>
      </div>
    </div>
  )
}

interface AvatarBoxProps {
  candidate: DTSI_Candidate
  electoralVotes: number | undefined
  className?: string
}

function AvatarBox(props: AvatarBoxProps) {
  const { candidate, electoralVotes, className } = props

  return (
    <div className={className}>
      <DTSIAvatar className="rounded-full" person={candidate} size={135} />
      {electoralVotes ? <p className="text-lg font-bold">{electoralVotes}</p> : null}
    </div>
  )
}

function getOpacity(
  candidate: DTSI_Candidate | null,
  raceData: PresidentialDataWithVotingResponse[] | undefined,
) {
  if (!raceData) return 'opacity-100'
  if (!candidate) return 'opacity-100'

  const calledCandidate = raceData?.find(_candidate => _candidate.votingData?.called)
  if (!calledCandidate) return 'opacity-100'

  return calledCandidate.id === candidate.id ? 'opacity-100' : 'opacity-50'
}
