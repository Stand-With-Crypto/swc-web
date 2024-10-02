import { useCallback, useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import {
  DTSI_Candidate,
  DTSI_DDHQ_Candidate,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { convertDTSIStanceScoreToBgColorClass } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Progress } from '@/components/ui/progress'
import { GetRacesResponse } from '@/data/decisionDesk/types'
import { useDecisionDeskPresidentRace } from '@/hooks/useApiDecisionDeskRaces'
import { cn } from '@/utils/web/cn'

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: GetRacesResponse
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = {} as GetRacesResponse } = props

  const candidateA = useMemo(() => candidates?.[0] || {}, [candidates])
  const candidateB = useMemo(() => candidates?.[1] || {}, [candidates])

  const { data } = useDecisionDeskPresidentRace(initialRaceData, {
    race_date: '2020-11-03',
    election_type_id: '1',
    year: '2020',
    limit: '250',
    office_id: '1',
  })

  const raceData = data?.data?.[0]

  const ddhqCandidateA = useMemo<DTSI_DDHQ_Candidate | null>(() => {
    if (!raceData) return null

    const candidate = raceData?.candidates?.find(
      _candidate => _candidate?.last_name.toLowerCase() === candidateA.lastName.toLowerCase(),
    )

    if (!candidate) return null

    return {
      ...candidateA,
      ...candidate,
    }
  }, [candidateA, raceData])

  const ddhqCandidateB = useMemo<DTSI_DDHQ_Candidate | null>(() => {
    if (!raceData) return null

    const candidate = raceData?.candidates?.find(
      _candidate => _candidate?.last_name.toLowerCase() === candidateB.lastName.toLowerCase(),
    )

    if (!candidate) return null

    return {
      ...candidateB,
      ...candidate,
    }
  }, [candidateB, raceData])

  const getTotalVotes = useCallback(
    (candidate: DTSI_DDHQ_Candidate | null) => {
      if (!data?.data || !candidate?.cand_id) return 0
      let votes = 0
      data.data.forEach(race => {
        if (race.topline_results?.total_votes !== 0) {
          votes += race.topline_results?.votes[candidate.cand_id] || 0
        }
      })
      return votes
    },
    [data],
  )

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex justify-between">
        <AvatarBox candidate={candidateA} />
        <AvatarBox candidate={candidateB} className="flex flex-col items-end text-right" />
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
          <p className="font-bold">50%</p>{' '}
          <span className="text-fontcolor-muted">{getTotalVotes(ddhqCandidateA)}</span>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p>{' '}
          <span className="text-fontcolor-muted">{getTotalVotes(ddhqCandidateB)}</span>
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
      <DTSIAvatar className="rounded-full" person={candidate} size={125} />
      <p className="text-lg font-bold">999</p>
    </div>
  )
}
