import { ContentSection } from '@/components/app/ContentSection'
import { InternalLink } from '@/components/ui/link'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface KeyRacesStatesProps {
  countryCode: SupportedCountryCodes
  isGovernorRace: boolean
}

export function KeyRacesStates({ countryCode, isGovernorRace }: KeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  return (
    <ContentSection
      className="container"
      title={`Other races across ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}`}
    >
      <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
        {Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(currentStateCode => {
          const stateCode = currentStateCode as USStateCode

          return (
            <InternalLink
              className={cn('mb-4 block flex-shrink-0 font-semibold')}
              href={
                isGovernorRace
                  ? urls.locationStateSpecificGovernorRace(stateCode)
                  : urls.locationStateSpecificSenateRace(stateCode)
              }
              key={stateCode}
            >
              {US_STATE_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
            </InternalLink>
          )
        })}
      </div>
    </ContentSection>
  )
}
