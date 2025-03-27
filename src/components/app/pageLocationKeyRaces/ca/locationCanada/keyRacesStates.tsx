import { ContentSection } from '@/components/app/ContentSection'
import { InternalLink } from '@/components/ui/link'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  CAProvinceOrTerritoryCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import {
  COUNTRY_CODE_TO_DISPLAY_NAME,
  SupportedCountryCodes,
} from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface CAKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
}

export function CAKeyRacesStates({ countryCode }: CAKeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)

  const orderedStateCodes = Object.keys(
    CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  ).sort()

  return (
    <ContentSection
      className="container"
      title={`Other races across ${COUNTRY_CODE_TO_DISPLAY_NAME[countryCode]}`}
    >
      <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-4">
        {orderedStateCodes.map(currentStateCode => {
          const stateCode = currentStateCode as CAProvinceOrTerritoryCode

          return (
            <InternalLink
              className={cn('mb-4 block flex-shrink-0 font-semibold')}
              href={urls.locationStateSpecific(stateCode)}
              key={stateCode}
            >
              {CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP[stateCode]}
            </InternalLink>
          )
        })}
      </div>
    </ContentSection>
  )
}
