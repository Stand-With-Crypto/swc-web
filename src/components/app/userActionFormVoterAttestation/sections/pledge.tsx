import React, { useCallback } from 'react'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIPersonHeroCardSection } from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
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
import { useLocale } from '@/hooks/useLocale'
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
  const locale = useLocale()
  const { congressional, senate, presidential, stateCode, districtNumber } =
    racesByAddressData ?? {}

  const handleSuccess = useCallback(() => {
    if (isLoading) {
      return null
    }

    onSuccess()
  }, [isLoading, onSuccess])

  return (
    <>
      <ScrollArea className="overflow-auto">
        <div className="space-y-6 md:space-y-10">
          <PledgeSectionWrapper className={dialogContentPaddingTopStyles}>
            <PageTitle size="sm">Check who's on the ballot and pledge to vote</PageTitle>
          </PledgeSectionWrapper>

          <PledgeSectionWrapper>
            <GooglePlacesSelect
              onChange={onChangeAddress}
              placeholder="Your full address"
              value={address}
            />
          </PledgeSectionWrapper>

          {isLoading ? (
            <PledgeSectionSkeleton />
          ) : (
            <>
              {presidential && (
                <PledgeSectionWrapper>
                  <DTSIPersonHeroCardSection
                    forceMobile
                    locale={locale}
                    people={presidential}
                    title="Presidential Election"
                    titleProps={{
                      size: 'xs',
                    }}
                  />
                </PledgeSectionWrapper>
              )}

              {senate && (
                <>
                  <hr />
                  <PledgeSectionWrapper>
                    <DTSIPersonHeroCardSection
                      forceMobile
                      locale={locale}
                      people={senate}
                      title={`U.S. Senate Race${stateCode ? ` (${stateCode})` : ''}`}
                      titleProps={{
                        size: 'xs',
                      }}
                    />
                  </PledgeSectionWrapper>
                </>
              )}

              {congressional && (
                <>
                  <hr />
                  <PledgeSectionWrapper className={dialogContentPaddingBottomStyles}>
                    <DTSIPersonHeroCardSection
                      forceMobile
                      locale={locale}
                      people={congressional}
                      title={`Congressional District${districtNumber ? ` ${districtNumber}` : ''}`}
                      titleProps={{
                        size: 'xs',
                      }}
                    />
                  </PledgeSectionWrapper>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      <DialogFooterSection>
        <Button
          className="w-full sm:max-w-md"
          disabled={isLoading || isSubmitting}
          onClick={handleSuccess}
          size="lg"
        >
          I pledge to vote pro-crypto
        </Button>
      </DialogFooterSection>
    </>
  )
}

function PledgeSectionWrapper({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(dialogContentPaddingXStyles, className)}>
      <div className={'mx-auto flex max-w-96 flex-col gap-6 md:gap-10'}>{children}</div>
    </div>
  )
}

export function PledgeSectionSkeleton() {
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
