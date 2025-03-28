import { InternalLink } from '@/components/ui/link'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  USStateCode,
} from '@/utils/shared/stateMappings/usStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface USKeyRacesStatesProps {
  countryCode: SupportedCountryCodes
  isGovernorRace: boolean
}

export function USKeyRacesStates({ countryCode, isGovernorRace }: USKeyRacesStatesProps) {
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
