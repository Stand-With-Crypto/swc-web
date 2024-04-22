import { FilterFn } from '@tanstack/react-table'
import isNil from 'lodash-es/isNil'

import {
  Person,
  PERSON_TABLE_COLUMNS_IDS,
} from '@/components/app/dtsiClientPersonDataTable/columns'
import {
  PARTY_OPTIONS,
  ROLE_OPTIONS,
  StanceOnCryptoOptions,
} from '@/components/app/dtsiClientPersonDataTable/globalFiltersUtils'
import { DTSI_PersonRoleCategory, DTSI_PersonRoleStatus } from '@/data/dtsi/generated'

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

  [PERSON_TABLE_COLUMNS_IDS.STANCE]: (row, columnId, filterValue, addMeta) => {
    if (filterValue === StanceOnCryptoOptions.ALL) {
      return true
    }
    const scoreToUse =
      row.original.manuallyOverriddenStanceScore ?? row.original.computedStanceScore
    if (filterValue === StanceOnCryptoOptions.PENDING) {
      return isNil(scoreToUse)
    }
    if (filterValue === StanceOnCryptoOptions.NEUTRAL) {
      return scoreToUse === 50
    }
    const stance =
      !scoreToUse || scoreToUse === 50
        ? null
        : scoreToUse > 50
          ? StanceOnCryptoOptions.PRO_CRYPTO
          : StanceOnCryptoOptions.ANTI_CRYPTO
    return stance === filterValue
  },

  [PERSON_TABLE_COLUMNS_IDS.ROLE]: (row, columnId, filterValue, addMeta) => {
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

  [PERSON_TABLE_COLUMNS_IDS.PARTY]: (row, columnId, filterValue, addMeta) => {
    return (
      filterValue === PARTY_OPTIONS.ALL || filterValue === row.original.politicalAffiliationCategory
    )
  },

  [PERSON_TABLE_COLUMNS_IDS.STATE]: (row, columnId, filterValue, addMeta) => {
    return filterValue === 'All' || row.original.primaryRole?.primaryState === filterValue
  },
})
