import { DTSI_DistrictSpecificInformationQuery } from '@/data/dtsi/generated'
import { StateSpecificDTSIPerson } from '@/utils/dtsi/stateSpecificDTSIPerson'

export type FormattedPerson = StateSpecificDTSIPerson<
  DTSI_DistrictSpecificInformationQuery['people'][0]
>
