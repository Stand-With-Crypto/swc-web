import { ContentSection } from '@/components/app/ContentSection'
import { InternalLink } from '@/components/ui/link'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  GBCountryCode,
} from '@/utils/shared/stateMappings/gbCountryUtils'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface GBKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
}

export function GBKeyRacesStates({ countryCode }: GBKeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  const orderedStateCodes = Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP).sort()

  return (
    <ContentSection
      className="container"
      title={`Other races across ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}`}
    >
      <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
        {orderedStateCodes.map(currentStateCode => {
          const stateCode = currentStateCode as GBCountryCode

          return (
            <InternalLink
              className={cn('mb-4 block flex-shrink-0 font-semibold')}
              href={urls.locationStateSpecific(stateCode)}
              key={stateCode}
            >
              {GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
            </InternalLink>
          )
        })}
      </div>
    </ContentSection>
  )
}
