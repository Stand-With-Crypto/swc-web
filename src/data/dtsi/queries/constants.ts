import { DTSI_PersonGrouping } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [
    DTSI_PersonGrouping.CURRENT_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.CURRENT_US_SENATE,
    DTSI_PersonGrouping.US_PRESIDENT,
    DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.RUNNING_FOR_US_SENATE,
    DTSI_PersonGrouping.RUNNING_FOR_PRESIDENT,
    DTSI_PersonGrouping.NEXT_PRESIDENT,
    DTSI_PersonGrouping.NEXT_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.NEXT_US_SENATE,
  ],
  [SupportedCountryCodes.AU]: [
    DTSI_PersonGrouping.CURRENT_AU_HOUSE_OF_REPS,
    DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS,
    DTSI_PersonGrouping.NEXT_AU_HOUSE_OF_REPS,
  ],
  [SupportedCountryCodes.GB]: [
    DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.NEXT_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS,
  ],
  [SupportedCountryCodes.CA]: [
    DTSI_PersonGrouping.CURRENT_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.NEXT_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS,
  ],
}

export const PERSON_ROLE_GROUPINGS_FOR_STATE_SPECIFIC_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [
    DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.RUNNING_FOR_US_SENATE,
  ],
  [SupportedCountryCodes.AU]: [
    DTSI_PersonGrouping.RUNNING_FOR_AU_SENATE,
    DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS,
  ],
  [SupportedCountryCodes.GB]: [
    DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_LORDS,
    DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS,
  ],
  [SupportedCountryCodes.CA]: [
    DTSI_PersonGrouping.RUNNING_FOR_CA_SENATE,
    DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS,
  ],
}

export const PERSON_ROLE_GROUPINGS_FOR_SENATE_SPECIFIC_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [DTSI_PersonGrouping.RUNNING_FOR_US_SENATE],
  [SupportedCountryCodes.AU]: [DTSI_PersonGrouping.RUNNING_FOR_AU_SENATE],
  [SupportedCountryCodes.GB]: [DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_LORDS],
  [SupportedCountryCodes.CA]: [DTSI_PersonGrouping.RUNNING_FOR_CA_SENATE],
}

export const PERSON_ROLE_GROUPINGS_FOR_HOUSE_SPECIFIC_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS],
  [SupportedCountryCodes.AU]: [DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS],
  [SupportedCountryCodes.GB]: [DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS],
  [SupportedCountryCodes.CA]: [DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS],
}
