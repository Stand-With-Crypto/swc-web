import { InternalLink } from '@/components/ui/link'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { US_STATE_CODE_TO_DISPLAY_NAME_MAP, USStateCode } from '@/utils/shared/usStateUtils'
import { cn } from '@/utils/web/cn'

interface KeyRacesStatesProps {
  countryCode: SupportedCountryCodes
  isGovernorRace: boolean
}

export function KeyRacesStates({ countryCode, isGovernorRace }: KeyRacesStatesProps) {
  const urls = getIntlUrls(countryCode)
  return Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).map(currentStateCode => {
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
  })
}
