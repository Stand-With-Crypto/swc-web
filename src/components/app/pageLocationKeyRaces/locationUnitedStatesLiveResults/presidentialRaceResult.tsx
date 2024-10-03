'use client'

import { useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import {
  DTSI_Candidate,
  DTSI_DDHQ_PresidentCandidate,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { convertDTSIStanceScoreToBgColorClass } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Progress } from '@/components/ui/progress'
import { GetElectoralCollegeResponse } from '@/data/decisionDesk/types'
import { useDecisionDeskPresidentRace } from '@/hooks/useApiDecisionDeskRaces'
import { cn } from '@/utils/web/cn'

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: GetElectoralCollegeResponse
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = {} as GetElectoralCollegeResponse } = props

  const candidateA = useMemo(() => candidates?.[0] || {}, [candidates])
  const candidateB = useMemo(() => candidates?.[1] || {}, [candidates])

  const { data, isLoading, isValidating } = useDecisionDeskPresidentRace(initialRaceData)

  console.log('PRESIDENT DATA: ', {
    initialRaceData,
    data,
    isLoading,
    isValidating,
  })

  const ddhqCandidateA = useMemo<DTSI_DDHQ_PresidentCandidate | null>(() => {
    if (!data) return null

    const candidate = data?.candidates?.find(
      _candidate => _candidate?.last_name.toLowerCase() === candidateA.lastName.toLowerCase(),
    )

    if (!candidate) return null

    return {
      ...candidateA,
      ...candidate,
    }
  }, [candidateA, data])

  const ddhqCandidateB = useMemo<DTSI_DDHQ_PresidentCandidate | null>(() => {
    if (!data) return null

    const candidate = data?.candidates?.find(
      _candidate => _candidate?.last_name.toLowerCase() === candidateB.lastName.toLowerCase(),
    )

    if (!candidate) return null

    return {
      ...candidateB,
      ...candidate,
    }
  }, [candidateB, data])

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex justify-between">
        <AvatarBox candidate={candidateA} electoralVotes={ddhqCandidateA?.electoral_votes_total} />
        <AvatarBox
          candidate={candidateB}
          className="flex flex-col items-end text-right"
          electoralVotes={ddhqCandidateB?.electoral_votes_total}
        />
      </div>

      <div className="flex">
        <Progress
          className="h-6 rounded-l-full rounded-r-none bg-gray-800"
          indicatorClassName={cn(
            'bg-none rounded-r-none',
            convertDTSIStanceScoreToBgColorClass(
              candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
            ),
          )}
          value={50}
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
          value={50}
        />
      </div>

      <div className="relative flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateA?.percentage}</p>{' '}
          <span className="text-fontcolor-muted">{ddhqCandidateA?.votes}</span>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className="flex items-center gap-2">
          <p className="font-bold">{ddhqCandidateB?.percentage}</p>{' '}
          <span className="text-fontcolor-muted">{ddhqCandidateB?.votes}</span>
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
