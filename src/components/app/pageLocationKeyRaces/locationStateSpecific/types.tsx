import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { SpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export type FormattedPerson = SpecificRoleDTSIPerson<
  DTSI_StateSpecificInformationQuery['people'][0]
>
