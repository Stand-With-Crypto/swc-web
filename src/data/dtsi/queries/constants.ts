import { DTSI_PersonGrouping } from '@/data/dtsi/generated'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const PERSON_ROLE_GROUPINGS_FOR_ALL_PEOPLE_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [
    DTSI_PersonGrouping.CURRENT_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.CURRENT_US_SENATE,
    DTSI_PersonGrouping.CURRENT_US_PRESIDENT,
    DTSI_PersonGrouping.CURRENT_US_STATE_ATTORNEY_GENERAL,
    DTSI_PersonGrouping.CURRENT_US_STATE_GOVERNOR,
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
    DTSI_PersonGrouping.NEXT_AU_SENATE,
    DTSI_PersonGrouping.RUNNING_FOR_AU_SENATE,
    DTSI_PersonGrouping.CURRENT_AU_SENATE,
  ],
  [SupportedCountryCodes.GB]: [
    DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.NEXT_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_LORDS,
    DTSI_PersonGrouping.NEXT_UK_HOUSE_OF_LORDS,
    DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_LORDS,
  ],
  [SupportedCountryCodes.CA]: [
    DTSI_PersonGrouping.CURRENT_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.NEXT_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.CURRENT_CA_SENATE,
    DTSI_PersonGrouping.NEXT_CA_SENATE,
    DTSI_PersonGrouping.RUNNING_FOR_CA_SENATE,
  ],
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific person groupings when they become available in DTSI
    // For now, using an empty array as placeholder
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
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific state-specific person groupings when they become available in DTSI
    // For now, using an empty array as placeholder
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
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific senate-like groupings when they become available in DTSI
  ],
}

export const PERSON_ROLE_GROUPINGS_FOR_HOUSE_SPECIFIC_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS],
  [SupportedCountryCodes.AU]: [DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS],
  [SupportedCountryCodes.GB]: [DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS],
  [SupportedCountryCodes.CA]: [DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS],
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific house-like groupings when they become available in DTSI
  ],
}

export const PERSON_ROLE_GROUPINGS_FOR_DISTRICT_SPECIFIC_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [DTSI_PersonGrouping.RUNNING_FOR_US_HOUSE_OF_REPS],
  [SupportedCountryCodes.AU]: [DTSI_PersonGrouping.RUNNING_FOR_AU_HOUSE_OF_REPS],
  [SupportedCountryCodes.GB]: [DTSI_PersonGrouping.RUNNING_FOR_UK_HOUSE_OF_COMMONS],
  [SupportedCountryCodes.CA]: [DTSI_PersonGrouping.RUNNING_FOR_CA_HOUSE_OF_COMMONS],
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific district-like groupings when they become available in DTSI
  ],
}

export const PERSON_ROLE_GROUPINGS_FOR_CURRENT_PEOPLE_BY_CONGRESS_DISTRICT_QUERY: Record<
  SupportedCountryCodes,
  DTSI_PersonGrouping[]
> = {
  [SupportedCountryCodes.US]: [
    DTSI_PersonGrouping.CURRENT_US_HOUSE_OF_REPS,
    DTSI_PersonGrouping.CURRENT_US_SENATE,
    DTSI_PersonGrouping.CURRENT_US_PRESIDENT,
    DTSI_PersonGrouping.CURRENT_US_STATE_ATTORNEY_GENERAL,
    DTSI_PersonGrouping.CURRENT_US_STATE_GOVERNOR,
  ],
  [SupportedCountryCodes.AU]: [
    DTSI_PersonGrouping.CURRENT_AU_HOUSE_OF_REPS,
    DTSI_PersonGrouping.CURRENT_AU_SENATE,
  ],
  [SupportedCountryCodes.GB]: [
    DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.CURRENT_UK_HOUSE_OF_LORDS,
  ],
  [SupportedCountryCodes.CA]: [
    DTSI_PersonGrouping.CURRENT_CA_HOUSE_OF_COMMONS,
    DTSI_PersonGrouping.CURRENT_CA_SENATE,
  ],
  [SupportedCountryCodes.EU]: [
    // TODO(EU): Add EU-specific current people by congress district groupings when they become available in DTSI
  ],
}
