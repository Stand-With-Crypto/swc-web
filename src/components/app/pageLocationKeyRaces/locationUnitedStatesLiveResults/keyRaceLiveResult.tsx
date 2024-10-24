'use client'

import { useMemo } from 'react'
import { isNil } from 'lodash-es'
import { usePathname } from 'next/navigation'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  LiveStatusBadge,
  Status,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  DTSI_DDHQ_Candidate,
  useInitialCandidateSelection,
  useLiveCandidateSelection,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/useCandidateSelection'
import {
  convertDTSIStanceScoreToBgColorClass,
  getOpacity,
  getPoliticalCategoryAbbr,
  getRaceStatus,
  getVotePercentage,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskData } from '@/hooks/useApiDecisionDeskStateData'
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
  primaryDistrict: NormalizedDTSIDistrictId | undefined
  className?: string
}

export function KeyRaceLiveResult(props: KeyRaceLiveResultProps) {
  const { candidates, stateCode, primaryDistrict, className, locale, initialRaceData } = props

  const pathname = usePathname()
  const isDistrictPage = pathname?.includes(
    getIntlUrls(locale).locationDistrictSpecific({
      stateCode,
      district: primaryDistrict ?? ('' as NormalizedDTSIDistrictId),
    }),
  )
  const isSenatePage = pathname?.includes(
    getIntlUrls(locale).locationStateSpecificSenateRace(stateCode),
  )
  const isPresidentialPage = pathname?.includes(
    getIntlUrls(locale).locationUnitedStatesPresidential(),
  )

  const [candidateA, candidateB] = useInitialCandidateSelection(candidates)

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
  const showLink = !isDistrictPage && !isSenatePage && !isPresidentialPage

  const { data: liveResultData, isLoading } = useApiDecisionDeskData({
    initialRaceData,
    stateCode,
    district: primaryDistrict?.toString(),
  })

  const raceData = useMemo(() => {
    if (!liveResultData) return null

    if (primaryDistrict) {
      return (
        liveResultData?.find?.(race => {
          return (
            race.district.toString().toLowerCase() === primaryDistrict.toString().toLowerCase() &&
            race.office?.officeId?.toString() === '3' &&
            race.candidatesWithVotes.some(
              _candidate =>
                getPoliticianFindMatch(candidateA, _candidate) ||
                getPoliticianFindMatch(candidateB, _candidate),
            )
          )
        }) ?? null
      )
    }

    return (
      liveResultData?.find?.(race =>
        race.candidatesWithVotes.some(
          _candidate =>
            getPoliticianFindMatch(candidateA, _candidate) ||
            getPoliticianFindMatch(candidateB, _candidate),
        ),
      ) ?? null
    )
  }, [candidateA, candidateB, liveResultData, primaryDistrict])

  const [ddhqCandidateA, ddhqCandidateB] = useLiveCandidateSelection(candidates, raceData)

  const lastUpdated = useMemo(() => {
    if (!raceData?.lastUpdated) return

    return new Date(raceData.lastUpdated).toLocaleString()
  }, [raceData])

  const raceStatus = useMemo<Status>(() => {
    return getRaceStatus(raceData)
  }, [raceData])

  const canShowProgress = Boolean(liveResultData)

  const shouldHideCard =
    (!candidateA || !candidateB || !ddhqCandidateA || !ddhqCandidateB) && !isLoading

  if (shouldHideCard) {
    return null
  }

  return (
    <div className={cn('flex w-full max-w-xl flex-col gap-6', className)}>
      {showLink ? (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{raceName}</p>
            {lastUpdated && (
              <p className="text-sm text-fontcolor-muted">Data updated {lastUpdated}</p>
            )}
          </div>
          <LiveStatusBadge
            status={raceStatus}
            winnerName={
              raceData?.calledCandidate
                ? `${raceData?.calledCandidate?.first_name} ${raceData?.calledCandidate?.last_name}`
                : ''
            }
          />
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center gap-6">
          <LiveStatusBadge
            status={raceStatus}
            winnerName={
              raceData?.calledCandidate
                ? `${raceData?.calledCandidate?.first_name} ${raceData?.calledCandidate?.last_name}`
                : ''
            }
          />
          {lastUpdated && (
            <p className="text-center text-base text-fontcolor-muted">Data updated {lastUpdated}</p>
          )}
        </div>
      )}

      <div className="flex justify-between">
        <AvatarBox
          className={cn(getOpacity(ddhqCandidateA, raceData))}
          ddhqCandidate={ddhqCandidateA}
          dtsiCandidate={candidateA}
        />
        <AvatarBox
          className={cn('flex flex-col items-end text-right', getOpacity(ddhqCandidateB, raceData))}
          ddhqCandidate={ddhqCandidateB}
          dtsiCandidate={candidateB}
        />
      </div>

      <div className="space-y-3">
        <div className="flex gap-1">
          {canShowProgress ? (
            <Progress
              className={cn(
                'rounded-l-full rounded-r-none bg-secondary',
                getOpacity(ddhqCandidateA, raceData),
              )}
              indicatorClassName={cn(
                'bg-none rounded-r-none',
                convertDTSIStanceScoreToBgColorClass(
                  ddhqCandidateA?.manuallyOverriddenStanceScore ??
                    ddhqCandidateA?.computedStanceScore,
                ),
              )}
              value={Math.min(+getVotePercentage(ddhqCandidateA, raceData).toFixed(0) * 2, 100)}
            />
          ) : (
            <Skeleton className="h-4 w-full rounded-full" />
          )}
          {canShowProgress ? (
            <Progress
              className={cn(
                'rounded-l-none rounded-r-full  bg-secondary',
                getOpacity(ddhqCandidateB, raceData),
              )}
              indicatorClassName={cn(
                'bg-none rounded-l-none',
                convertDTSIStanceScoreToBgColorClass(
                  ddhqCandidateB?.manuallyOverriddenStanceScore ??
                    ddhqCandidateB?.computedStanceScore,
                ),
              )}
              inverted
              value={Math.min(+getVotePercentage(ddhqCandidateB, raceData).toFixed(0) * 2, 100)}
            />
          ) : (
            <Skeleton className="h-4 w-full rounded-full" />
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <VoteCount
            className={cn(getOpacity(ddhqCandidateA, raceData))}
            percentage={getVotePercentage(ddhqCandidateA, raceData)}
            votes={FormattedNumber({ amount: ddhqCandidateA?.votes || 0, locale })}
          />
          <VoteCount
            className={cn('text-right', getOpacity(ddhqCandidateB, raceData))}
            percentage={getVotePercentage(ddhqCandidateB, raceData)}
            votes={FormattedNumber({ amount: ddhqCandidateB?.votes || 0, locale })}
          />
        </div>
      </div>

      {showLink && (
        <Button asChild className="mx-auto w-fit" variant="secondary">
          <InternalLink href={link}>View Race</InternalLink>
        </Button>
      )}
    </div>
  )
}

interface AvatarBoxProps {
  dtsiCandidate: DTSI_Candidate
  ddhqCandidate: DTSI_DDHQ_Candidate | undefined
  className?: string
}

function AvatarBox(props: AvatarBoxProps) {
  const { dtsiCandidate, ddhqCandidate, className } = props
  const candidate = ddhqCandidate || dtsiCandidate

  if (!candidate) {
    return null
  }

  return (
    <div className={className}>
      <div className="relative w-fit">
        <DTSIAvatar person={candidate} size={125} />
        <DTSIFormattedLetterGrade
          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
          person={candidate}
        />
      </div>
      <div className="mt-6 space-y-2">
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

interface VoteCountProps {
  votes: string | undefined
  percentage: number | undefined
  className?: string
}

function VoteCount(props: VoteCountProps) {
  const { votes, percentage, className } = props

  return (
    <div className={cn('flex items-center text-xs md:text-sm', className)}>
      {!isNil(votes) ? (
        <span>
          {!!percentage && <span className="mr-2 font-bold">{percentage.toFixed(2)}%</span>}
          <span className="font-normal text-fontcolor-muted">{votes} votes</span>
        </span>
      ) : null}
    </div>
  )
}
