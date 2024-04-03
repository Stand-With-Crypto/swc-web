import { DTSI_StateSpecificInformationQuery } from '@/data/dtsi/generated'
import { StateSpecificDTSIPerson } from '@/utils/dtsi/stateSpecificDTSIPerson'

export type FormattedPerson = StateSpecificDTSIPerson<
  DTSI_StateSpecificInformationQuery['people'][0]
>
