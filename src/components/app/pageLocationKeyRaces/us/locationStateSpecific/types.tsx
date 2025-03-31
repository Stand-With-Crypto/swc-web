import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { USSpecificRoleDTSIPerson } from '@/utils/dtsi/specificRoleDTSIPerson'

export type FormattedPerson = USSpecificRoleDTSIPerson<
  DTSI_StateSpecificInformationQuery['people'][0]
>
