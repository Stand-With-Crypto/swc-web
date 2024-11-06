'use client'

import { useMemo } from 'react'
import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { usePathname } from 'next/navigation'

import { AvatarBox } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/LiveResultCard/avatarBox'
import { Progress } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/LiveResultCard/progress'
import { VoteCount } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/LiveResultCard/voteCount'
import {
  LiveStatusBadge,
  RaceStatus,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import {
  useInitialCandidateSelection,
  useLiveCandidateSelection,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/useCandidateSelection'
import {
  convertDTSIStanceScoreToBgColorClass,
  getOpacity,
  getRaceStatus,
  getVotePercentage,
} from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { Button } from '@/components/ui/button'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { InternalLink } from '@/components/ui/link'
import { RacesVotingDataResponse } from '@/data/aggregations/decisionDesk/types'
import { getMatchingDDHQCandidateForDTSIPerson } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskData } from '@/hooks/useApiDecisionDeskStateData'
import { SupportedLocale } from '@/intl/locales'
import { formatDTSIDistrictId, NormalizedDTSIDistrictId } from '@/utils/dtsi/dtsiPersonRoleUtils'
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

  const { data: liveResultData } = useApiDecisionDeskData({
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
            (!!getMatchingDDHQCandidateForDTSIPerson(candidateA, race.candidatesWithVotes) ||
              !!getMatchingDDHQCandidateForDTSIPerson(candidateB, race.candidatesWithVotes))
          )
        }) ?? null
      )
    }

    return (
      liveResultData?.find?.(
        race =>
          !!getMatchingDDHQCandidateForDTSIPerson(candidateA, race.candidatesWithVotes) ||
          !!getMatchingDDHQCandidateForDTSIPerson(candidateB, race.candidatesWithVotes),
      ) ?? null
    )
  }, [candidateA, candidateB, liveResultData, primaryDistrict])

  const [ddhqCandidateA, ddhqCandidateB] = useLiveCandidateSelection(candidates, raceData)

  const lastUpdated = useMemo(() => {
    if (!raceData?.lastUpdated) return ''

    const tzDate = new TZDate(raceData.lastUpdated, 'America/New_York')

    return format(tzDate, "'Data updated' M/d/yy 'at' h:mm a 'ET'")
  }, [raceData])

  const raceStatus = useMemo<RaceStatus>(() => {
    return getRaceStatus(raceData)
  }, [raceData])

  const winnerName = useMemo(() => {
    if (!raceData) return ''
    if (!raceData.calledCandidate) return ''
    // @ts-expect-error
    const firstName = raceData.calledCandidate?.first_name || raceData.calledCandidate?.firstName
    // @ts-expect-error
    const lastName = raceData.calledCandidate?.last_name || raceData.calledCandidate?.lastName
    const fullName = `${firstName} ${lastName}`
    if (fullName.includes('undefined')) return ''
    return fullName
  }, [raceData])

  const canShowProgress = Boolean(liveResultData)

  const isUncontested = useMemo(() => {
    if (!raceData) return false
    return raceData?.candidatesWithVotes.length === 1
  }, [raceData])

  if (isUncontested) {
    return null
  }

  return (
    <div className={cn('flex w-full max-w-xl flex-col gap-6', className)}>
      {showLink ? (
        <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row">
          <div className="space-y-2">
            <InternalLink className="text-lg font-semibold text-primary" href={link}>
              {raceName}
            </InternalLink>
            {lastUpdated && <p className="text-sm text-fontcolor-muted">{lastUpdated}</p>}
          </div>
          <LiveStatusBadge
            className="mx-auto sm:mx-0"
            status={raceStatus}
            winnerName={raceData?.calledCandidate ? winnerName : ''}
          />
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center gap-6">
          <LiveStatusBadge
            status={raceStatus}
            winnerName={raceData?.calledCandidate ? winnerName : ''}
          />
          {lastUpdated && (
            <p className="text-center text-base text-fontcolor-muted">{lastUpdated}</p>
          )}
        </div>
      )}

      <div className="flex justify-between">
        {!!ddhqCandidateA && (
          <AvatarBox
            className={cn(getOpacity(ddhqCandidateA, raceData))}
            ddhqCandidate={ddhqCandidateA}
            locale={locale}
          />
        )}
        {!!ddhqCandidateB && (
          <AvatarBox
            className={cn(
              'flex flex-col items-end text-right',
              getOpacity(ddhqCandidateB, raceData),
            )}
            ddhqCandidate={ddhqCandidateB}
            locale={locale}
          />
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <div className="flex h-4 justify-between overflow-hidden rounded-full bg-secondary text-xs text-white">
            {canShowProgress && ddhqCandidateA ? (
              <Progress
                className={cn(
                  convertDTSIStanceScoreToBgColorClass(
                    ddhqCandidateA?.manuallyOverriddenStanceScore ??
                      ddhqCandidateA?.computedStanceScore,
                  ),
                  getOpacity(ddhqCandidateA, raceData),
                  'border-r-2 border-white',
                )}
                percentage={getVotePercentage(ddhqCandidateA, raceData)}
              />
            ) : null}

            <div className="absolute bottom-1/2 left-1/2 right-1/2 top-1/2 h-6 w-[2px] -translate-x-1/2 -translate-y-1/2 transform bg-black/80" />

            {canShowProgress && ddhqCandidateB ? (
              <Progress
                className={cn(
                  convertDTSIStanceScoreToBgColorClass(
                    ddhqCandidateB?.manuallyOverriddenStanceScore ??
                      ddhqCandidateB?.computedStanceScore,
                  ),
                  getOpacity(ddhqCandidateB, raceData),
                  'border-l-2 border-white',
                )}
                percentage={getVotePercentage(ddhqCandidateB, raceData)}
              />
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {!!ddhqCandidateA && (
            <VoteCount
              className={cn(getOpacity(ddhqCandidateA, raceData))}
              percentage={getVotePercentage(ddhqCandidateA, raceData)}
              votes={FormattedNumber({ amount: ddhqCandidateA?.votes || 0, locale })}
            />
          )}
          {!!ddhqCandidateB && (
            <VoteCount
              className={cn('text-right', getOpacity(ddhqCandidateB, raceData))}
              percentage={getVotePercentage(ddhqCandidateB, raceData)}
              votes={FormattedNumber({ amount: ddhqCandidateB?.votes || 0, locale })}
            />
          )}
        </div>
      </div>

      {showLink && (
        <Button asChild className="mx-auto w-fit" variant="secondary">
          <InternalLink href={link}>View race</InternalLink>
        </Button>
      )}
    </div>
  )
}
