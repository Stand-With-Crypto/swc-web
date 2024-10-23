'use client'

import { useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { convertDTSIStanceScoreToBgColorClass } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskPresidentialData } from '@/hooks/useApiDecisionDeskPresidentialData'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { cn } from '@/utils/web/cn'

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: PresidentialDataWithVotingResponse[] | null
  progressBarBackground?: string
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = null, progressBarBackground } = props

  const candidateA = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Trump') || candidates?.[0],
    [candidates],
  )
  const candidateB = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Harris') || candidates?.[1],
    [candidates],
  )

  const { data: liveResultData } = useApiDecisionDeskPresidentialData(initialRaceData)

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
        <AvatarBox candidate={candidateA} className={cn(getOpacity(candidateA, liveResultData))} />
        <AvatarBox
          candidate={candidateB}
          className={cn(
            'flex flex-col items-end text-right',
            getOpacity(candidateB, liveResultData),
          )}
        />
      </div>

      <div className="flex">
        {canShowProgress ? (
          <>
            <Progress
              className={cn(
                'h-6 rounded-l-full rounded-r-none bg-[#23262B]',
                progressBarBackground,
              )}
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
              className={cn(
                'h-6 rounded-l-none rounded-r-full border-l bg-[#23262B]',
                progressBarBackground,
              )}
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
        <div className={cn('flex items-center gap-2', getOpacity(candidateA, liveResultData))}>
          <p className="font-bold">{ddhqCandidateA?.votingData?.electoralVotes}</p>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className={cn('flex items-center gap-2', getOpacity(candidateB, liveResultData))}>
          <p className="font-bold">{ddhqCandidateB?.votingData?.electoralVotes}</p>
        </div>
      </div>
    </div>
  )
}

interface AvatarBoxProps {
  candidate: DTSI_Candidate
  className?: string
}

function AvatarBox(props: AvatarBoxProps) {
  const { candidate, className } = props

  return (
    <div className={className}>
      <div className="relative w-fit">
        <DTSIAvatar className="rounded-full" person={candidate} size={125} />
        <DTSIFormattedLetterGrade
          className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-md"
          person={candidate}
        />
      </div>
      <div className="mt-2">
        <p className="text-lg font-bold">{dtsiPersonFullName(candidate)}</p>
      </div>
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
