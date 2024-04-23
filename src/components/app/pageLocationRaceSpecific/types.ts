import { DTSI_DistrictSpecificInformationQuery } from '@/data/dtsi/generated'
import { SpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export type FormattedPerson = SpecificRoleDTSIPerson<
  DTSI_DistrictSpecificInformationQuery['people'][0]
>
