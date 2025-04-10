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
    if (filterValue === ROLE_OPTIONS.ALL) {
      return true
    }

    const rolesArray = [ROLE_OPTIONS.HOUSE_OF_COMMONS]

    if (rolesArray.includes(filterValue)) {
      return (
        filterValue === row.original.primaryRole?.roleCategory &&
        row.original.primaryRole?.status === DTSI_PersonRoleStatus.HELD
      )
    }
    return (
      !row.original.primaryRole?.roleCategory ||
      !rolesArray.includes(row.original.primaryRole?.roleCategory) ||
      row.original.primaryRole?.status !== DTSI_PersonRoleStatus.HELD
    )
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
  CONSERVATIVE: DTSI_PersonPoliticalAffiliationCategory.CONSERVATIVE,
  LABOR: DTSI_PersonPoliticalAffiliationCategory.LABOR,
  LIBERAL_DEMOCRAT: DTSI_PersonPoliticalAffiliationCategory.LIBERAL_DEMOCRAT,
  GREEN: DTSI_PersonPoliticalAffiliationCategory.GREEN,
  INDEPENDENT: DTSI_PersonPoliticalAffiliationCategory.INDEPENDENT,
  OTHER: DTSI_PersonPoliticalAffiliationCategory.OTHER,
}

export function getPartyOptionDisplayName(party: string) {
  switch (party) {
    case PARTY_OPTIONS.CONSERVATIVE:
      return 'Conservative'
    case PARTY_OPTIONS.LABOR:
      return 'Labor'
    case PARTY_OPTIONS.LIBERAL_DEMOCRAT:
      return 'Liberal Democrat'
    case PARTY_OPTIONS.GREEN:
      return 'Green'
    case PARTY_OPTIONS.INDEPENDENT:
      return 'Independent'
    case PARTY_OPTIONS.OTHER:
      return 'Other Parties'
    default:
      return 'All'
  }
}

export const ROLE_OPTIONS = {
  ALL: 'All',
  HOUSE_OF_COMMONS: DTSI_PersonRoleCategory.HOUSE_OF_COMMONS,
  ALL_OTHER: 'ALL_OTHER',
}

export function getRoleOptionDisplayName(role: string) {
  switch (role) {
    case ROLE_OPTIONS.ALL_OTHER:
      return 'Candidate'
    case ROLE_OPTIONS.HOUSE_OF_COMMONS:
      return 'House of Commons'
    default:
      return 'All'
  }
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
