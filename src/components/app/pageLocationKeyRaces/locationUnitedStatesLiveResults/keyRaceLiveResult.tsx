import { useMemo } from 'react'
import { isNil } from 'lodash-es'

import { DTSIAvatar, DTSIAvatarProps } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  LiveStatusBadge,
  Status,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { Progress } from '@/components/ui/progress'
import { Candidate, GetRacesResponse } from '@/data/decisionDesk/types'
import { DTSI_Person, DTSI_PersonPoliticalAffiliationCategory } from '@/data/dtsi/generated'
import { useApiDecisionDeskRaces } from '@/hooks/useApiDecisionDeskRaces'
import { SupportedLocale } from '@/intl/locales'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import {
  dtsiPersonFullName,
  dtsiPersonPoliticalAffiliationCategoryAbbreviation,
} from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn, twNoop } from '@/utils/web/cn'

const convertDTSIStanceScoreToBgColorClass = (score: number | null | undefined) => {
  if (isNil(score)) {
    return twNoop('bg-gray-400')
  }
  if (score > 50) {
    return twNoop('bg-green-700')
  }
  if (score === 50) {
    return twNoop('bg-yellow-600')
  }
  return twNoop('bg-red-700')
}

const getPoliticalCategoryAbbr = (category: DTSI_PersonPoliticalAffiliationCategory) => {
  if (!category) return ''
  return dtsiPersonPoliticalAffiliationCategoryAbbreviation(category) || ''
}

type DTSI_Candidate = DTSIAvatarProps['person'] &
  Pick<
    DTSI_Person,
    | 'politicalAffiliationCategory'
    | 'computedStanceScore'
    | 'computedSumStanceScoreWeight'
    | 'manuallyOverriddenStanceScore'
  >

type DTSI_DDHQ_Candidate = DTSI_Candidate & Candidate

interface KeyRaceLiveResultProps {
  locale: SupportedLocale
  candidates: DTSI_Candidate[]
  stateCode: USStateCode
  primaryDistrict?: NormalizedDTSIDistrictId
  className?: string
}

export const KeyRaceLiveResult = (props: KeyRaceLiveResultProps) => {
  const { candidates, stateCode, primaryDistrict, className, locale } = props

  const candidateA = useMemo(() => candidates?.[0] || {}, [candidates])
  const candidateB = useMemo(() => candidates?.[1] || {}, [candidates])

  const stateName = US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]
  const raceName = primaryDistrict
    ? `${stateName} ${formatDTSIDistrictId(primaryDistrict)} Congressional District Race`
    : `${stateName} Senate Race`

  const urls = getIntlUrls(locale)
  const link = primaryDistrict
    ? urls.locationDistrictSpecific({
        stateCode: stateCode,
        district: primaryDistrict,
      })
    : urls.locationStateSpecificSenateRace(stateCode)

  const { data } = useApiDecisionDeskRaces({} as GetRacesResponse, {
    district: primaryDistrict?.toString(),
    state: stateCode,
    office_id: primaryDistrict ? '3' : '4',
  })

  // console.log('DecisionDesk Data: ', { stateName, primaryDistrict, data, isLoading, isValidating })

  const raceData = data.data?.[0]

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

  const calledCandidateId = useMemo(() => {
    if (!raceData) return null
    return raceData?.topline_results?.called_candidates?.[0]
  }, [raceData])

  const lastUpdated = useMemo(() => {
    if (!raceData?.last_updated) return

    return new Date(raceData.last_updated).toLocaleString()
  }, [raceData])

  const raceStatus = useMemo<Status>(() => {
    if (!raceData) return 'unknown'

    if (raceData.topline_results?.called_candidates?.length > 0) {
      return 'called'
    }

    const now = new Date()
    const raceDate = new Date(raceData.race_date)

    if (now < raceDate) {
      return 'not-started'
    }

    return 'live'
  }, [raceData])

  const getTotalVotes = (candidate: DTSI_DDHQ_Candidate | null) => {
    if (!candidate) return 0
    return raceData?.topline_results?.votes?.[candidate.cand_id] || 0
  }

  const getVotePercentage = (candidate: DTSI_DDHQ_Candidate | null) => {
    if (!candidate) return 0
    const totalVotes = raceData?.topline_results?.total_votes
    if (isNil(totalVotes)) return 0
    const candidateVotes = raceData.topline_results?.votes?.[candidate.cand_id]
    return candidateVotes ? ((candidateVotes / totalVotes) * 100).toFixed(2) : 0
  }

  const getOpacity = (candidate: DTSI_DDHQ_Candidate | null) => {
    if (!calledCandidateId) return 'opacity-100'
    if (!candidate) return 'opacity-100'
    if (calledCandidateId !== candidate.cand_id) return 'opacity-50'
    return 'opacity-100'
  }

  return (
    <div className={cn('flex w-full max-w-lg flex-col gap-8', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-lg font-semibold">{raceName}</p>
          {lastUpdated ? (
            <p className="text-sm text-fontcolor-muted">Data updated {lastUpdated}</p>
          ) : (
            <p className="text-sm text-fontcolor-muted"> </p>
          )}
        </div>

        <LiveStatusBadge status={raceStatus} />
      </div>

      <div className="flex justify-between">
        <AvatarBox candidate={candidateA} className={getOpacity(ddhqCandidateA)} />
        <AvatarBox
          candidate={candidateB}
          className={cn('flex flex-col items-end text-right', getOpacity(ddhqCandidateA))}
        />
      </div>

      <div className="flex gap-1">
        <Progress
          className="rounded-l-full rounded-r-none bg-secondary"
          indicatorClassName={cn(
            'bg-none rounded-r-none',
            convertDTSIStanceScoreToBgColorClass(
              candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
            ),
          )}
          value={Math.min(Number(getVotePercentage(ddhqCandidateA)) * 2, 100)}
        />
        <Progress
          className="rounded-l-none rounded-r-full  bg-secondary"
          indicatorClassName={cn(
            'bg-none rounded-l-none',
            convertDTSIStanceScoreToBgColorClass(
              candidateB.manuallyOverriddenStanceScore || candidateB.computedStanceScore,
            ),
          )}
          inverted
          value={Math.min(Number(getVotePercentage(ddhqCandidateB)) * 2, 100)}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">{getVotePercentage(ddhqCandidateA)}%</p>
          <span className="text-fontcolor-muted">{getTotalVotes(ddhqCandidateA)} votes</span>
        </div>

        {/* <p className="text-sm text-fontcolor-muted">999 votes to win</p> */}

        <div className="flex items-center gap-2 text-right">
          <p className="font-bold">{getVotePercentage(ddhqCandidateB)}%</p>
          <span className="text-fontcolor-muted">{getTotalVotes(ddhqCandidateB)} votes</span>
        </div>
      </div>

      <Button asChild className="mx-auto w-fit" variant="secondary">
        <InternalLink href={link}>View Race</InternalLink>
      </Button>
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
        <DTSIAvatar person={candidate} size={125} />
        <DTSIFormattedLetterGrade
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
          person={candidate}
        />
      </div>
      <div className="mt-4 space-y-2">
        <p className="font-semibold">
          {dtsiPersonFullName(candidate)}
          {!!candidate.politicalAffiliationCategory &&
            ` (${getPoliticalCategoryAbbr(candidate.politicalAffiliationCategory)})`}
        </p>
        <p className="text-xs text-fontcolor-muted">
          {convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence(candidate)}
        </p>
      </div>
    </div>
  )
}
