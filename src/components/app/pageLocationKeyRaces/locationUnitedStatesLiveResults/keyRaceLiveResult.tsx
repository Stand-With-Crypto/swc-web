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
  primaryDistrict?: NormalizedDTSIDistrictId
  className?: string
}

export function KeyRaceLiveResult(props: KeyRaceLiveResultProps) {
  const { candidates, stateCode, primaryDistrict, className, locale, initialRaceData } = props

  const pathname = usePathname()
  const isDistrictPage = pathname?.includes(
    getIntlUrls(locale).locationDistrictSpecific({
      stateCode,
      district: primaryDistrict || ('' as NormalizedDTSIDistrictId),
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
            race.district.toString() === primaryDistrict.toString() &&
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
    if (!raceData) return 'unknown'

    if (raceData.calledCandidate) {
      return 'called'
    }

    const now = new Date()
    const raceDate = new Date(raceData.raceDate || '2024-11-05')

    if (now < raceDate) {
      return 'not-started'
    }

    return 'live'
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
          className={cn(
            getOpacity(ddhqCandidateA, raceData),
            ddhqCandidateA ? 'border-2 border-green-500' : 'border-2 border-red-500',
          )}
          ddhqCandidate={ddhqCandidateA}
          dtsiCandidate={candidateA}
        />
        <AvatarBox
          className={cn(
            'flex flex-col items-end text-right',
            getOpacity(ddhqCandidateB, raceData),
            ddhqCandidateB ? 'border-2 border-green-500' : 'border-2 border-red-500',
          )}
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
                  ddhqCandidateA?.manuallyOverriddenStanceScore ||
                    ddhqCandidateA?.computedStanceScore,
                ),
              )}
              value={+getVotePercentage(ddhqCandidateA, raceData).toFixed(2) * 2}
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
                  ddhqCandidateB?.manuallyOverriddenStanceScore ||
                    ddhqCandidateB?.computedStanceScore,
                ),
              )}
              inverted
              value={+getVotePercentage(ddhqCandidateB, raceData).toFixed(2) * 2}
            />
          ) : (
            <Skeleton className="h-4 w-full rounded-full" />
          )}
        </div>

        <div className="relative flex items-center justify-between text-sm">
          <div className={cn('flex items-center gap-2', getOpacity(ddhqCandidateA, raceData))}>
            {!isNil(ddhqCandidateA?.votes) ? (
              <>
                <p className="font-bold">{getVotePercentage(ddhqCandidateA, raceData)}%</p>
                <span className="text-fontcolor-muted">
                  {FormattedNumber({ amount: ddhqCandidateA?.votes || 0, locale })} votes
                </span>{' '}
              </>
            ) : null}
          </div>

          <div
            className={cn(
              'flex items-center gap-2 text-right',
              getOpacity(ddhqCandidateB, raceData),
            )}
          >
            {!isNil(ddhqCandidateB?.votes) ? (
              <>
                <p className="font-bold">{getVotePercentage(ddhqCandidateB, raceData)}%</p>
                <span className="text-fontcolor-muted">
                  {FormattedNumber({ amount: ddhqCandidateB?.votes || 0, locale })} votes
                </span>
              </>
            ) : null}
          </div>
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
