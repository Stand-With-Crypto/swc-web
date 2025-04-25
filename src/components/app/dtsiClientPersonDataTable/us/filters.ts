import { ColumnFiltersState, FilterFn } from '@tanstack/react-table'
import isNil from 'lodash-es/isNil'

import {
  Person,
  PERSON_TABLE_COLUMNS_IDS,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { StanceOnCryptoOptions } from '@/components/app/dtsiClientPersonDataTable/common/filters'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { isPoliticianDetailsStanceHidden } from '@/utils/dtsi/dtsiPersonUtils'

/**
 * Custom filter logic for each Column.
 *
 * @see https://tanstack.com/table/latest/docs/guide/column-filtering#filterfns
 */
export const getPersonDataTableFilterFns = (): Record<
  PERSON_TABLE_COLUMNS_IDS,
  FilterFn<Person>
> => ({
  [PERSON_TABLE_COLUMNS_IDS.FULL_NAME]: () => true,

  [PERSON_TABLE_COLUMNS_IDS.STANCE]: (row, _columnId, filterValue, _addMeta) => {
    const scoreToUse =
      row.original.manuallyOverriddenStanceScore ?? row.original.computedStanceScore
    const isStanceHidden = isPoliticianDetailsStanceHidden(row.original.slug)

    if (isStanceHidden) {
      return filterValue === StanceOnCryptoOptions.ALL
    }

    if (filterValue === StanceOnCryptoOptions.ALL) {
      return true
    }

    if (filterValue === StanceOnCryptoOptions.PENDING) {
      return isNil(scoreToUse)
    }

    if (filterValue === StanceOnCryptoOptions.NEUTRAL) {
      return !isNil(scoreToUse) && scoreToUse >= 50 && scoreToUse < 70
    }

    if (filterValue === StanceOnCryptoOptions.PRO_CRYPTO) {
      return !isNil(scoreToUse) && scoreToUse >= 70
    }

    if (filterValue === StanceOnCryptoOptions.ANTI_CRYPTO) {
      return !isNil(scoreToUse) && scoreToUse < 50
    }

    return false
  },

  [PERSON_TABLE_COLUMNS_IDS.ROLE]: (row, _columnId, filterValue, _addMeta) => {
    switch (filterValue as (typeof ROLE_OPTIONS)[keyof typeof ROLE_OPTIONS]) {
      case ROLE_OPTIONS.ALL:
        return true
      case ROLE_OPTIONS.SENATE:
      case ROLE_OPTIONS.CONGRESS:
      case ROLE_OPTIONS.GOVERNOR:
      case ROLE_OPTIONS.ATTORNEY_GENERAL:
        return !!(
          filterValue === row.original.primaryRole?.roleCategory &&
          row.original.primaryRole?.status === DTSI_PersonRoleStatus.HELD
        )
      case ROLE_OPTIONS.EXECUTIVE:
        return !!(
          row.original.primaryRole?.roleCategory &&
          [DTSI_PersonRoleCategory.PRESIDENT, DTSI_PersonRoleCategory.VICE_PRESIDENT].includes(
            row.original.primaryRole?.roleCategory,
          ) &&
          row.original.primaryRole?.status === DTSI_PersonRoleStatus.HELD
        )
      case ROLE_OPTIONS.ALL_OTHER:
        return !(
          row.original.primaryRole?.roleCategory &&
          [
            DTSI_PersonRoleCategory.PRESIDENT,
            DTSI_PersonRoleCategory.VICE_PRESIDENT,
            DTSI_PersonRoleCategory.SENATE,
            DTSI_PersonRoleCategory.CONGRESS,
            DTSI_PersonRoleCategory.GOVERNOR,
            DTSI_PersonRoleCategory.ATTORNEY_GENERAL,
          ].includes(row.original.primaryRole?.roleCategory) &&
          row.original.primaryRole?.status === DTSI_PersonRoleStatus.HELD
        )
    }
  },

  [PERSON_TABLE_COLUMNS_IDS.PARTY]: (row, _columnId, filterValue, _addMeta) => {
    return (
      filterValue === PARTY_OPTIONS.ALL || filterValue === row.original.politicalAffiliationCategory
    )
  },

  [PERSON_TABLE_COLUMNS_IDS.STATE]: (row, _columnId, filterValue, _addMeta) => {
    return (
      filterValue === 'All' || row.original.primaryRole?.primaryState?.toUpperCase() === filterValue
    )
  },
})

export const PARTY_OPTIONS = {
  ALL: 'All',
  REPUBLICAN: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DEMOCRAT: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
}
export function getPartyOptionDisplayName(party: string) {
  switch (party) {
    case PARTY_OPTIONS.REPUBLICAN:
      return 'Republican'
    case PARTY_OPTIONS.DEMOCRAT:
      return 'Democratic'
    default:
      return 'All'
  }
}

export const ROLE_OPTIONS = {
  ALL: 'All',
  SENATE: DTSI_PersonRoleCategory.SENATE,
  CONGRESS: DTSI_PersonRoleCategory.CONGRESS,
  GOVERNOR: DTSI_PersonRoleCategory.GOVERNOR,
  ATTORNEY_GENERAL: DTSI_PersonRoleCategory.ATTORNEY_GENERAL,
  EXECUTIVE: 'EXECUTIVE',
  ALL_OTHER: 'ALL_OTHER',
} as const

const ROLE_OPTION_DISPLAY_NAME_MAP: Record<
  (typeof ROLE_OPTIONS)[keyof typeof ROLE_OPTIONS],
  string
> = {
  [ROLE_OPTIONS.ALL_OTHER]: 'Other Political Figure',
  [ROLE_OPTIONS.SENATE]: 'Senator',
  [ROLE_OPTIONS.CONGRESS]: 'Representative',
  [ROLE_OPTIONS.GOVERNOR]: 'Governor',
  [ROLE_OPTIONS.ATTORNEY_GENERAL]: 'Attorney General',
  [ROLE_OPTIONS.EXECUTIVE]: 'Executive Branch',
  [ROLE_OPTIONS.ALL]: 'All',
}
export function getRoleOptionDisplayName(role: string): string {
  return ROLE_OPTION_DISPLAY_NAME_MAP[role as keyof typeof ROLE_OPTION_DISPLAY_NAME_MAP]
}

export const getGlobalFilterDefaults = (): ColumnFiltersState => [
  {
    id: PERSON_TABLE_COLUMNS_IDS.STANCE,
    value: StanceOnCryptoOptions.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.ROLE,
    value: ROLE_OPTIONS.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.PARTY,
    value: PARTY_OPTIONS.ALL,
  },
  {
    id: PERSON_TABLE_COLUMNS_IDS.STATE,
    value: 'All',
  },
]
