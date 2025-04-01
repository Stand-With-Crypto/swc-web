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
import { isPoliticianStanceHidden } from '@/utils/dtsi/dtsiPersonUtils'

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
    const isStanceHidden = isPoliticianStanceHidden(row.original.slug)

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
    if (filterValue === ROLE_OPTIONS.ALL) {
      return true
    }
    if ([ROLE_OPTIONS.SENATE, ROLE_OPTIONS.CONGRESS].includes(filterValue)) {
      return (
        filterValue === row.original.primaryRole?.roleCategory &&
        row.original.primaryRole?.status === DTSI_PersonRoleStatus.HELD
      )
    }
    return (
      !row.original.primaryRole?.roleCategory ||
      ![DTSI_PersonRoleCategory.SENATE, DTSI_PersonRoleCategory.CONGRESS].includes(
        row.original.primaryRole?.roleCategory,
      ) ||
      row.original.primaryRole?.status !== DTSI_PersonRoleStatus.HELD
    )
  },

  [PERSON_TABLE_COLUMNS_IDS.PARTY]: (row, _columnId, filterValue, _addMeta) => {
    return (
      filterValue === PARTY_OPTIONS.ALL || filterValue === row.original.politicalAffiliationCategory
    )
  },

  [PERSON_TABLE_COLUMNS_IDS.STATE]: (row, _columnId, filterValue, _addMeta) => {
    return filterValue === 'All' || row.original.primaryRole?.primaryState === filterValue
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
  ALL_OTHER: 'ALL_OTHER',
}
export function getRoleOptionDisplayName(role: string) {
  switch (role) {
    case ROLE_OPTIONS.ALL_OTHER:
      return 'Other Political Figure'
    case ROLE_OPTIONS.SENATE:
      return 'Senator'
    case ROLE_OPTIONS.CONGRESS:
      return 'Representative'
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
