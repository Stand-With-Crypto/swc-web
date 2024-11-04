import { ScrollArea } from '@radix-ui/react-scroll-area'

import { ContentSection } from '@/components/app/ContentSection'
import { DTSIStanceDetails } from '@/components/app/dtsiStanceDetails'
import { ScrollBar } from '@/components/ui/scroll-area'
import { DTSI_PersonStanceType, DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SupportedLocale } from '@/intl/locales'
import { USStateCode } from '@/utils/shared/usStateUtils'

interface StancesSectionProps {
  stateCode: USStateCode
  stateName: string
  locale: SupportedLocale
  stances: DTSI_StateSpecificInformationQuery['personStances']
}

export function StancesSection(props: StancesSectionProps) {
  const { stances, stateCode, stateName, locale } = props

  const twitterStances = stances.filter(x => x.stanceType === DTSI_PersonStanceType.TWEET)

  return (
    <ContentSection
      subtitle={<>Keep up with recent tweets about crypto from politicians in {stateName}.</>}
      title={<>What politicians in {stateCode} are saying</>}
    >
      <ScrollArea>
        <div className="flex justify-center gap-5 pb-3 pl-4">
          {twitterStances.map(stance => {
            return (
              <div className="flex w-[300px] shrink-0 flex-col lg:w-[500px]" key={stance.id}>
                <DTSIStanceDetails
                  bodyClassName="line-clamp-6"
                  className="flex-grow"
                  hideImages
                  locale={locale}
                  person={stance.person}
                  stance={stance}
                />
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </ContentSection>
  )
}
