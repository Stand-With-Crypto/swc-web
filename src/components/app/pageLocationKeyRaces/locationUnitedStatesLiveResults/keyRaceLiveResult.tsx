import { useMemo } from 'react'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  LiveStatusBadge,
  Status,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  convertDTSIStanceScoreToBgColorClass,
  getOpacity,
  getPoliticalCategoryAbbr,
  getVotePercentage,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/getAllRacesData'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskData } from '@/hooks/useApiDesicionDeskData'
import { SupportedLocale } from '@/intl/locales'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { convertDTSIPersonStanceScoreToCryptoSupportLanguageSentence } from '@/utils/dtsi/dtsiStanceScoreUtils'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

interface KeyRaceLiveResultProps {
  locale: SupportedLocale
  candidates: DTSI_Candidate[]
  initialRaceData: RacesVotingDataResponse[] | undefined
  stateCode: USStateCode
  primaryDistrict?: NormalizedDTSIDistrictId
  className?: string
}

export function KeyRaceLiveResult(props: KeyRaceLiveResultProps) {
  const { candidates, stateCode, primaryDistrict, className, locale, initialRaceData } = props

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

  const { data, isLoading, isValidating } = useApiDecisionDeskData(initialRaceData, {
    stateCode,
    district: primaryDistrict?.toString(),
  })

  console.log('DecisionDesk Data: ', {
    stateName,
    primaryDistrict,
    data,
    initialRaceData,
    isLoading,
    isValidating,
  })

  const raceData = useMemo(() => {
    if (!data) return null

    if (primaryDistrict) {
      return (
        data?.find?.(race => {
          return (
            race.district === primaryDistrict &&
            Boolean(
              race.candidatesWithVotes.find(
                candidate =>
                  candidate.lastName.toLowerCase() === candidateA.lastName.toLowerCase() ||
                  candidate.lastName.toLowerCase() === candidateB.lastName.toLowerCase(),
              ),
            )
          )
        }) ?? null
      )
    }

    return (
      data?.find?.(race =>
        Boolean(
          race.candidatesWithVotes.find(
            candidate =>
              candidate.lastName.toLowerCase() === candidateA.lastName.toLowerCase() ||
              candidate.lastName.toLowerCase() === candidateB.lastName.toLowerCase(),
          ),
        ),
      ) ?? null
    )
  }, [candidateA, candidateB, data, primaryDistrict])

  const ddhqCandidateA = useMemo(() => {
    if (!raceData) return null

    const candidate = raceData?.candidatesWithVotes?.find(_candidate =>
      getPoliticianFindMatch(
        candidateA.firstName,
        candidateA.lastName,
        _candidate.firstName,
        _candidate.lastName,
      ),
    )

    if (!candidate) return null

    return candidate
  }, [candidateA, raceData])

  const ddhqCandidateB = useMemo(() => {
    if (!raceData) return null

    const candidate = raceData?.candidatesWithVotes?.find(_candidate =>
      getPoliticianFindMatch(
        candidateB.firstName,
        candidateB.lastName,
        _candidate.firstName,
        _candidate.lastName,
      ),
    )

    if (!candidate) return null

    return candidate
  }, [candidateB, raceData])

  const lastUpdated = useMemo(() => {
    if (!raceData?.lastUpdated) return

    return new Date(raceData.lastUpdated).toLocaleString()
  }, [raceData])

  const raceStatus = useMemo<Status>(() => {
    if (!raceData) return 'unknown'

    if (raceData.calledCandidate) {
      return 'called'
    }

    const now = new Date()
    const raceDate = new Date(raceData.raceDate)

    if (now < raceDate) {
      return 'not-started'
    }

    return 'live'
  }, [raceData])

  const canShowProgress = Boolean(data)

  return (
    <div className={cn('flex w-full flex-col gap-8', className)}>
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
        <AvatarBox candidate={candidateA} className={getOpacity(ddhqCandidateA, raceData)} />
        <AvatarBox
          candidate={candidateB}
          className={cn('flex flex-col items-end text-right', getOpacity(ddhqCandidateB, raceData))}
        />
      </div>

      <div className="flex gap-1">
        {canShowProgress ? (
          <Progress
            className="rounded-l-full rounded-r-none bg-secondary"
            indicatorClassName={cn(
              'bg-none rounded-r-none',
              convertDTSIStanceScoreToBgColorClass(
                candidateA.manuallyOverriddenStanceScore || candidateA.computedStanceScore,
              ),
            )}
            value={Math.min(Number(getVotePercentage(ddhqCandidateA, raceData)) * 2, 100)}
          />
        ) : (
          <Skeleton className="h-4 w-full rounded-full" />
        )}
        {canShowProgress ? (
          <Progress
            className="rounded-l-none rounded-r-full  bg-secondary"
            indicatorClassName={cn(
              'bg-none rounded-l-none',
              convertDTSIStanceScoreToBgColorClass(
                candidateB.manuallyOverriddenStanceScore || candidateB.computedStanceScore,
              ),
            )}
            inverted
            value={Math.min(Number(getVotePercentage(ddhqCandidateB, raceData)) * 2, 100)}
          />
        ) : (
          <Skeleton className="h-4 w-full rounded-full" />
        )}
      </div>

      <div className="relative flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="font-bold">{getVotePercentage(ddhqCandidateA, raceData)}%</p>
          <span className="text-fontcolor-muted">{ddhqCandidateA?.votes} votes</span>
        </div>

        {/* <p className="absolute left-1/2 right-1/2 w-fit text-fontcolor-muted -translate-x-1/2 text-nowrap text-sm">
          999 votes to win
        </p> */}

        <div className="flex items-center gap-2 text-right">
          <p className="font-bold">{getVotePercentage(ddhqCandidateB, raceData)}%</p>
          <span className="text-fontcolor-muted">{ddhqCandidateB?.votes} votes</span>
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
