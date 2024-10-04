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
  initialRaceData: PresidentialDataWithVotingResponse | null
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = null } = props

  const candidateA = useMemo(() => candidates?.[0] || {}, [candidates])
  const candidateB = useMemo(() => candidates?.[1] || {}, [candidates])

  const { data, isLoading, isValidating } = useApiDecisionDeskPresidentialData(initialRaceData)

  console.log('PRESIDENT DATA: ', {
    initialRaceData,
    data,
    isLoading,
    isValidating,
  })

  const ddhqCandidateA = useMemo(() => {
    if (!data) return null

    const candidate = data?.find(_candidate =>
      getPoliticianFindMatch(
        candidateA.firstName,
        candidateA.lastName,
        _candidate.firstName,
        _candidate.lastName,
      ),
    )

    if (!candidate) return null

    return candidate
  }, [candidateA, data])

  const ddhqCandidateB = useMemo(() => {
    if (!data) return null

    const candidate = data?.find(_candidate =>
      getPoliticianFindMatch(
        candidateB.firstName,
        candidateB.lastName,
        _candidate.firstName,
        _candidate.lastName,
      ),
    )

    if (!candidate) return null

    return {
      ...candidateB,
      ...candidate,
    }
  }, [candidateB, data])

  const canShowProgress = Boolean(data)

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
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
              className="h-6 rounded-l-full rounded-r-none bg-gray-800"
              indicatorClassName={cn(
                'bg-none rounded-r-none',
                convertDTSIStanceScoreToBgColorClass(
                  candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
                ),
              )}
              value={(ddhqCandidateA?.votingData?.percentage || 0) * 2}
            />
            <Progress
              className="h-6 rounded-l-none rounded-r-full border-l bg-gray-800"
              indicatorClassName={cn(
                'bg-none rounded-l-none',
                convertDTSIStanceScoreToBgColorClass(
                  candidateB.manuallyOverriddenStanceScore || candidateB.computedStanceScore,
                ),
              )}
              inverted
              value={(ddhqCandidateB?.votingData?.percentage || 0) * 2}
            />
          </>
        ) : (
          <Skeleton className="h-6 w-full rounded-full" />
        )}
      </div>

      <div className="relative flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateA?.votingData?.percentage}</p>{' '}
          <span className="text-fontcolor-muted">{ddhqCandidateA?.votingData?.votes}</span>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateB?.votingData?.percentage}</p>{' '}
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
      <DTSIAvatar className="rounded-full" person={candidate} size={125} />
      {electoralVotes ? <p className="text-lg font-bold">{electoralVotes}</p> : null}
    </div>
  )
}
