import { CASpecificRoleDTSIPerson } from '@/components/app/pageLocationKeyRaces/ca/locationCanada/specificRoleDTSIPerson'
import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'

export type FormattedPerson = CASpecificRoleDTSIPerson<
  DTSI_StateSpecificInformationQuery['people'][0]
>
