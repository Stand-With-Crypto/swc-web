'use client'

import { ContentSection } from '@/components/app/ContentSection'
import {
  DTSIPersonHeroCardSection,
  DTSIPersonHeroCardSectionProps,
} from '@/components/app/dtsiPersonHeroCard/dtsiPersonHeroCardSection'
import { PACFooter } from '@/components/app/pacFooter'
import { RacesByAddressData } from '@/components/app/userActionFormVoterAttestation/useRacesByAddress'
import {
  dialogContentPaddingBottomStyles,
  dialogContentPaddingXStyles,
} from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { Skeleton } from '@/components/ui/skeleton'
import { useCountryCode } from '@/hooks/useCountryCode'
import { cn } from '@/utils/web/cn'

interface KeyRacesListProps {
  races: RacesByAddressData | undefined
}

export function KeyRacesList(props: KeyRacesListProps) {
  const { races } = props

  const countryCode = useCountryCode()

  const { congressional, presidential, senate, stateCode, districtNumber } = races || {}

  const dtsiPersonHeroCardSectionProps: Pick<
    DTSIPersonHeroCardSectionProps,
    'forceMobile' | 'titleProps' | 'target'
  > = {
    titleProps: {
      size: 'xxs',
    },
    target: '_blank',
  }

  const doesNotHaveRaces = !congressional?.length && !presidential?.length && !senate?.length

  return (
    <div className="flex flex-1 flex-col space-y-6 md:space-y-10">
      {races ? (
        <>
          {doesNotHaveRaces && (
            <RaceSectionWrapper className="flex-1">
              <PageSubTitle>No races in your district.</PageSubTitle>
            </RaceSectionWrapper>
          )}

          {!!presidential && presidential?.length > 0 && (
            <RaceSectionWrapper>
              <DTSIPersonHeroCardSection
                {...dtsiPersonHeroCardSectionProps}
                countryCode={countryCode}
                people={presidential}
                title="Presidential Election"
              />
            </RaceSectionWrapper>
          )}

          {!!senate && senate?.length > 0 && (
            <>
              <hr />
              <RaceSectionWrapper>
                <DTSIPersonHeroCardSection
                  {...dtsiPersonHeroCardSectionProps}
                  countryCode={countryCode}
                  people={senate}
                  title={`U.S. Senate Race${stateCode ? ` (${stateCode})` : ''}`}
                />
              </RaceSectionWrapper>
            </>
          )}

          {!!congressional && congressional?.length > 0 && (
            <>
              <hr />
              <RaceSectionWrapper>
                <DTSIPersonHeroCardSection
                  {...dtsiPersonHeroCardSectionProps}
                  countryCode={countryCode}
                  people={congressional}
                  title={`Congressional District${districtNumber ? ` ${districtNumber}` : ''}`}
                />
              </RaceSectionWrapper>
            </>
          )}

          <RaceSectionWrapper className={cn(dialogContentPaddingBottomStyles, 'mt-auto')}>
            <PACFooter className="static" />
          </RaceSectionWrapper>
        </>
      ) : null}
    </div>
  )
}

function RaceSectionWrapper({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn(dialogContentPaddingXStyles, className)}>
      <div className={'mx-auto flex flex-col gap-6 md:gap-10'}>{children}</div>
    </div>
  )
}

export function KeyRacesSkeleton() {
  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <ContentSection
        className="w-full max-w-sm"
        title="Key races in your district"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>

      <ContentSection
        className="w-full max-w-sm"
        title="U.S. Senate Race"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>

      <ContentSection
        className="w-full max-w-sm"
        title="Congressional District"
        titleProps={{
          size: 'xs',
        }}
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-36 w-full rounded-3xl" key={index} />
        ))}
      </ContentSection>
    </div>
  )
}
