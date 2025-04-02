import { GBSpecificRoleDTSIPerson } from 'src/components/app/pageLocationKeyRaces/gb/locationUnitedKingdom/specificRoleDTSIPerson'

import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'

export type FormattedPerson = GBSpecificRoleDTSIPerson<
  DTSI_StateSpecificInformationQuery['people'][0]
>
