'use client'

import { useCallback, useMemo } from 'react'
import { isBefore, startOfDay } from 'date-fns'
import { isNil } from 'lodash-es'

import { DTSIAvatar } from '@/components/app/dtsiAvatar'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { LiveStatusBadge } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/liveStatusBadge'
import { DTSI_Candidate } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/types'
import { convertDTSIStanceScoreToBgColorClass } from '@/components/app/pageLocationKeyRaces/locationUnitedStatesLiveResults/utils'
import { FormattedNumber } from '@/components/ui/formattedNumber'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PresidentialDataWithVotingResponse } from '@/data/aggregations/decisionDesk/types'
import { getPoliticianFindMatch } from '@/data/aggregations/decisionDesk/utils'
import { useApiDecisionDeskPresidentialData } from '@/hooks/useApiDecisionDeskPresidentialData'
import { SupportedLocale } from '@/intl/locales'
import { dtsiPersonFullName } from '@/utils/dtsi/dtsiPersonUtils'
import { cn } from '@/utils/web/cn'

interface PresidentialRaceResultProps {
  candidates: DTSI_Candidate[]
  initialRaceData: PresidentialDataWithVotingResponse[] | null
  progressBarBackground?: string
  locale: SupportedLocale
}

export const PresidentialRaceResult = (props: PresidentialRaceResultProps) => {
  const { candidates, initialRaceData = null, progressBarBackground, locale } = props

  const dtsiCandidateA = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Trump') || candidates?.[0],
    [candidates],
  )
  const dtsiCandidateB = useMemo(
    () => candidates?.find(_candidate => _candidate.lastName === 'Harris') || candidates?.[1],
    [candidates],
  )

  const { data: liveResultData } = useApiDecisionDeskPresidentialData(initialRaceData)

  const ddhqCandidateA = useMemo(() => {
    if (!liveResultData) return null
    if (!dtsiCandidateA) return null

    const candidate = liveResultData?.find(_candidate =>
      getPoliticianFindMatch(dtsiCandidateA, _candidate.votingData),
    )

    if (!candidate) return null

    return {
      ...dtsiCandidateA,
      ...candidate,
    }
  }, [dtsiCandidateA, liveResultData])

  const ddhqCandidateB = useMemo(() => {
    if (!liveResultData) return null
    if (!dtsiCandidateB) return null

    const candidate = liveResultData?.find(_candidate =>
      getPoliticianFindMatch(dtsiCandidateB, _candidate.votingData),
    )

    if (!candidate) return null

    return {
      ...dtsiCandidateB,
      ...candidate,
    }
  }, [dtsiCandidateB, liveResultData])

  const canShowProgress = Boolean(liveResultData)
  const calledCandidate = useMemo(() => {
    if (!liveResultData) return null

    return liveResultData.find(candidate => candidate.votingData?.called)
  }, [liveResultData])

  const raceStatus = isBefore(startOfDay(new Date()), startOfDay(new Date('2024-11-05')))
    ? 'not-started'
    : calledCandidate
      ? 'called'
      : 'live'

  const getPercentage = useCallback((electoralVotes: number) => {
    return (electoralVotes / 538) * 100
  }, [])

  return (
    <div className="relative flex w-full flex-col gap-4">
      <div className="mt-4 flex items-center justify-between md:mt-0">
        <AvatarBox
          candidate={dtsiCandidateA}
          className={cn(getOpacity(dtsiCandidateA, liveResultData))}
        />

        <LiveStatusBadge
          className="absolute -top-4 left-1/2 right-1/2 w-fit -translate-x-1/2 whitespace-nowrap md:top-12"
          status={raceStatus}
          winnerName={calledCandidate ? dtsiPersonFullName(calledCandidate) : undefined}
        />

        <AvatarBox
          candidate={dtsiCandidateB}
          className={cn(
            'flex flex-col items-end text-right',
            getOpacity(dtsiCandidateB, liveResultData),
          )}
        />
      </div>

      <div className="relative flex items-center justify-between text-gray-400">
        <div className={cn('flex items-center gap-2', getOpacity(dtsiCandidateA, liveResultData))}>
          <p className="font-bold">{ddhqCandidateA?.votingData?.electoralVotes}</p>
        </div>

        <p className="absolute left-1/2 right-1/2 w-fit -translate-x-1/2 text-nowrap text-sm">
          270 to win
        </p>

        <div className={cn('flex items-center gap-2', getOpacity(dtsiCandidateB, liveResultData))}>
          <p className="font-bold">{ddhqCandidateB?.votingData?.electoralVotes}</p>
        </div>
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
                  dtsiCandidateA.manuallyOverriddenStanceScore ||
                    dtsiCandidateA.computedStanceScore,
                ),
                getOpacity(dtsiCandidateA, liveResultData),
              )}
              value={getPercentage(ddhqCandidateA?.votingData?.electoralVotes || 0) * 2}
            />
            <Progress
              className={cn(
                'h-6 rounded-l-none rounded-r-full border-l bg-[#23262B]',
                progressBarBackground,
              )}
              indicatorClassName={cn(
                'bg-none rounded-l-none',
                convertDTSIStanceScoreToBgColorClass(
                  dtsiCandidateB.manuallyOverriddenStanceScore ||
                    dtsiCandidateB.computedStanceScore,
                ),
                getOpacity(dtsiCandidateB, liveResultData),
              )}
              inverted
              value={getPercentage(ddhqCandidateB?.votingData?.electoralVotes || 0) * 2}
            />
          </>
        ) : (
          <Skeleton className="h-6 w-full rounded-full" />
        )}
      </div>

      <div className="relative flex items-center justify-between text-sm text-gray-400">
        <div
          className={cn(
            'flex items-center gap-2 md:gap-3',
            getOpacity(dtsiCandidateA, liveResultData),
          )}
        >
          {!isNil(ddhqCandidateA?.votingData?.votes) && (
            <>
              <p className="font-bold">
                {(ddhqCandidateA?.votingData?.percentage || 0)?.toFixed(2)}%
              </p>
              <p>
                {FormattedNumber({
                  amount: ddhqCandidateA?.votingData?.votes || 0,
                  locale,
                })}{' '}
                votes
              </p>
            </>
          )}
        </div>

        <div className={cn('flex items-center gap-2', getOpacity(dtsiCandidateB, liveResultData))}>
          {!isNil(ddhqCandidateB?.votingData?.votes) && (
            <>
              <p className="font-bold">
                {(ddhqCandidateB?.votingData?.percentage || 0)?.toFixed(2)}%
              </p>
              <p>
                {FormattedNumber({
                  amount: ddhqCandidateB?.votingData?.votes || 0,
                  locale,
                })}{' '}
                votes
              </p>
            </>
          )}
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
