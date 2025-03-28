'use client'

import { CAKeyRaces } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRaces'
import { CAKeyRacesStates } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/keyRacesStates'
import { caOrganizePeople } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/organizePeople'
import { LocationRaces } from '@/components/app/pageLocationKeyRaces/common'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const countryCode = SupportedCountryCodes.CA

export function LocationCanada({
  countAdvocates,
  groups,
}: {
  countAdvocates: number
  groups: Awaited<ReturnType<typeof caOrganizePeople>>
}) {
  return (
    <LocationRaces countAdvocates={countAdvocates} countryCode={countryCode}>
      <LocationRaces.KeyRaces>
        <CAKeyRaces groups={groups} />
      </LocationRaces.KeyRaces>
      <LocationRaces.KeyRacesStates countryCode={countryCode}>
        <CAKeyRacesStates />
      </LocationRaces.KeyRacesStates>
    </LocationRaces>
  )
}
