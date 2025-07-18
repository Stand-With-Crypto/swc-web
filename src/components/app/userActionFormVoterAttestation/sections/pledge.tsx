import React, { useCallback } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import {
  DTSIPersonHeroCardSection,
  DTSIPersonHeroCardSectionProps,
} from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { PACFooter } from '@/components/app/pacFooter'
import { DialogFooterSection } from '@/components/app/userActionFormVoterAttestation/dialogFooterSection'
import { RacesByAddressData } from '@/components/app/userActionFormVoterAttestation/useRacesByAddress'
import { Button } from '@/components/ui/button'
import {
  dialogContentPaddingBottomStyles,
  dialogContentPaddingTopStyles,
  dialogContentPaddingXStyles,
} from '@/components/ui/dialog/styles'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountryCode } from '@/hooks/useCountryCode'
import { cn } from '@/utils/web/cn'
import { GooglePlaceAutocompletePrediction } from '@/utils/web/googlePlaceUtils'

interface PledgeSectionProps {
  racesByAddressData?: RacesByAddressData
  isLoadingRaces: boolean
  onChangeAddress: (address: GooglePlaceAutocompletePrediction | null) => void
  address: GooglePlaceAutocompletePrediction | null
  onSuccess: () => void
  isSubmitting: boolean
}

export function PledgeSection({
  racesByAddressData,
  isLoadingRaces: isLoading,
  address,
  onChangeAddress,
  onSuccess,
  isSubmitting,
}: PledgeSectionProps) {
  const countryCode = useCountryCode()

  const {
    congressional,
    senate,
    presidential,
    stateCode,
    zoneName: electoralZone,
  } = racesByAddressData ?? {}

  const handleSuccess = useCallback(() => {
    if (isLoading) {
      return null
    }

    onSuccess()
  }, [isLoading, onSuccess])

  const dtsiPersonHeroCardSectionProps: Pick<
    DTSIPersonHeroCardSectionProps,
    'forceMobile' | 'titleProps' | 'target'
  > = {
    forceMobile: true,
    titleProps: {
      size: 'xs',
    },
    target: '_blank',
  }

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="overflow-auto md:max-h-[70vh]">
        <div className="space-y-6 md:space-y-10">
          <div className="space-y-4 md:space-y-6">
            <PledgeSectionWrapper className={dialogContentPaddingTopStyles}>
              <PageTitle size="sm">Check who's on the ballot and pledge to vote</PageTitle>
            </PledgeSectionWrapper>

            <PledgeSectionWrapper>
              <GooglePlacesSelect
                disabled={isSubmitting}
                onChange={onChangeAddress}
                placeholder="Your full address"
                value={address}
              />
            </PledgeSectionWrapper>
          </div>

          {isLoading ? (
            <PledgeSectionSkeleton />
          ) : (
            <>
              {!!presidential && presidential?.length > 0 && (
                <PledgeSectionWrapper>
                  <DTSIPersonHeroCardSection
                    countryCode={countryCode}
                    shouldHideStanceScores={false}
                    {...dtsiPersonHeroCardSectionProps}
                    people={presidential}
                    title="Presidential Election"
                  />
                </PledgeSectionWrapper>
              )}

              {!!senate && senate?.length > 0 && (
                <>
                  <hr />
                  <PledgeSectionWrapper>
                    <DTSIPersonHeroCardSection
                      countryCode={countryCode}
                      shouldHideStanceScores={false}
                      {...dtsiPersonHeroCardSectionProps}
                      people={senate}
                      title={`U.S. Senate Race${stateCode ? ` (${stateCode})` : ''}`}
                    />
                  </PledgeSectionWrapper>
                </>
              )}

              {!!congressional && congressional?.length > 0 && (
                <>
                  <hr />
                  <PledgeSectionWrapper>
                    <DTSIPersonHeroCardSection
                      countryCode={countryCode}
                      shouldHideStanceScores={false}
                      {...dtsiPersonHeroCardSectionProps}
                      people={congressional}
                      title={`Congressional District${electoralZone ? ` ${electoralZone}` : ''}`}
                    />
                  </PledgeSectionWrapper>
                </>
              )}
            </>
          )}
          <PledgeSectionWrapper className={dialogContentPaddingBottomStyles}>
            <PACFooter className="top-0" />
          </PledgeSectionWrapper>
        </div>
      </ScrollArea>
      <DialogFooterSection>
        <div className="w-full px-2 sm:max-w-md">
          <Button
            className="w-full"
            disabled={isLoading || isSubmitting}
            onClick={handleSuccess}
            size="lg"
          >
            {isSubmitting ? 'Loading...' : 'I pledge to vote'}
          </Button>
        </div>
      </DialogFooterSection>
    </div>
  )
}

function PledgeSectionWrapper({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(dialogContentPaddingXStyles, className)}>
      <div className={'mx-auto flex max-w-md flex-col gap-6 md:gap-10'}>{children}</div>
    </div>
  )
}

function PledgeSectionSkeleton() {
  return (
    <>
      <PledgeSectionWrapper>
        <ContentSection
          title="Presidential Election"
          titleProps={{
            size: 'xs',
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-36 w-full rounded-3xl" key={index} />
          ))}
        </ContentSection>
      </PledgeSectionWrapper>

      <hr />

      <PledgeSectionWrapper>
        <ContentSection
          title="U.S. Senate Race"
          titleProps={{
            size: 'xs',
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-36 w-full rounded-3xl" key={index} />
          ))}
        </ContentSection>
      </PledgeSectionWrapper>

      <hr />

      <PledgeSectionWrapper className={dialogContentPaddingBottomStyles}>
        <ContentSection
          title="Congressional District"
          titleProps={{
            size: 'xs',
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-36 w-full rounded-3xl" key={index} />
          ))}
        </ContentSection>
      </PledgeSectionWrapper>
    </>
  )
}
