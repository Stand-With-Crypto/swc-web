import { useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import {
  DTSI_Candidate,
  DTSI_DDHQ_Candidate,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { Progress } from '@/components/ui/progress'
import { GetRacesResponse } from '@/data/decisionDesk/types'
import { DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { useApiDecisionDeskRaces } from '@/hooks/useApiDecisionDeskRaces'
import { cn } from '@/utils/web/cn'

const PARTY_COLOR_MAP: Record<DTSI_PersonPoliticalAffiliationCategory, string> = {
  [DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT]: 'bg-blue-600',
  [DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN]: 'bg-red-600',
  [DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT]: 'bg-gray-600',
  [DTSI_PersonPoliticalAffiliationCategory.LIBERTARIAN]: 'bg-yellow-600',
  [DTSI_PersonPoliticalAffiliationCategory.OTHER]: '',
}

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: GetRacesResponse
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = {} as GetRacesResponse } = props

  const candidateA = useMemo(() => candidates?.[0] || {}, [candidates])
  const candidateB = useMemo(() => candidates?.[1] || {}, [candidates])

  const { data, isLoading, isValidating } = useApiDecisionDeskRaces(initialRaceData, {
    race_date: '2020-11-03',
    election_type_id: '1',
    year: '2020',
    limit: '250',
  })

  const raceData = data?.data?.[0]

  console.log('PRESIDENT Data: ', {
    data,
    initialRaceData,
    isLoading,
    isValidating,
  })

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
            PARTY_COLOR_MAP[
              candidateA.politicalAffiliationCategory ||
                DTSI_PersonPoliticalAffiliationCategory.OTHER
            ],
          )}
          value={50}
        />
        <Progress
          className="h-6 rounded-l-none rounded-r-full border-l bg-gray-800"
          indicatorClassName={cn(
            'bg-none rounded-l-none',
            PARTY_COLOR_MAP[
              candidateB.politicalAffiliationCategory ||
                DTSI_PersonPoliticalAffiliationCategory.OTHER
            ],
          )}
          inverted
          value={50}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
        </div>

        <p className="text-sm">270 to win</p>

        <div className="flex items-center gap-2">
          <p className="font-bold">50%</p> <span className="text-fontcolor-muted">99,999,999</span>
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
      <p className="font-bold">999</p>
    </div>
  )
}
