'use client'

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { ColumnFiltersState, SortingState } from '@tanstack/react-table'

import { PERSON_TABLE_COLUMNS_IDS } from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import {
  type MultipleSearchParamConfig,
  useMultipleSearchParamState,
} from '@/hooks/useMultipleSearchParamState'
import { useSearchParamState } from '@/hooks/useSearchParamState'

export function useSearchFilter(
  defaultValue: string = '',
): [string, Dispatch<SetStateAction<string | undefined | null>>] {
  const hasHydrated = useHasHydrated()
  const [searchValue, setSearchValue] = useSearchParamState('search', defaultValue)

  return [hasHydrated ? (searchValue ?? defaultValue) : defaultValue, setSearchValue]
}

const parseValueToString = (value?: SortingState[number]): string | null => {
  if (!value) return null

  const { id, desc } = value

  return `${id}.${desc ? 'desc' : 'asc'}`
}

export function useSortingFilter(
  defaultValue: SortingState = [],
): [SortingState, Dispatch<SetStateAction<SortingState>>] {
  const hasHydrated = useHasHydrated()

  const parsedDefaultValue = defaultValue.length > 0 ? parseValueToString(defaultValue.at(0)) : null
  const [sortValue, setSortValue] = useSearchParamState('sorting', parsedDefaultValue)

  const sortedValue = useMemo(() => {
    if (!sortValue) return []

    const [id, direction] = sortValue?.split('.') ?? []

    return [
      {
        id,
        desc: direction === 'desc',
      },
    ]
  }, [sortValue])

  const handleSortingValue: Dispatch<SetStateAction<SortingState>> = useCallback(
    newValue => {
      const valueToSet = typeof newValue === 'function' ? newValue(sortedValue) : newValue

      if (!valueToSet || valueToSet.length === 0) {
        return setSortValue(null)
      }

      const [currentSortingValue] = valueToSet

      return setSortValue(parseValueToString(currentSortingValue))
    },
    [sortedValue, setSortValue],
  )

  return [hasHydrated ? sortedValue : [], handleSortingValue]
}

const ROLE_KEY = PERSON_TABLE_COLUMNS_IDS.ROLE
const PARTY_KEY = PERSON_TABLE_COLUMNS_IDS.PARTY
const STATE_KEY = PERSON_TABLE_COLUMNS_IDS.STATE
const STANCE_KEY = PERSON_TABLE_COLUMNS_IDS.STANCE

const DEFAULT_FILTERS_VALUE = 'All'

export function useColumnFilters(): [
  ColumnFiltersState,
  Dispatch<SetStateAction<ColumnFiltersState>>,
] {
  const hasHydrated = useHasHydrated()

  const [searchParamValues, setSearchParamValues] = useMultipleSearchParamState({
    [ROLE_KEY]: DEFAULT_FILTERS_VALUE,
    [PARTY_KEY]: DEFAULT_FILTERS_VALUE,
    [STATE_KEY]: DEFAULT_FILTERS_VALUE,
    [STANCE_KEY]: DEFAULT_FILTERS_VALUE,
  })

  const roleValue = searchParamValues[ROLE_KEY]
  const partyValue = searchParamValues[PARTY_KEY]
  const stateValue = searchParamValues[STATE_KEY]
  const stanceValue = searchParamValues[STANCE_KEY]

  const filters: ColumnFiltersState = useMemo(
    () => [
      { id: STANCE_KEY, value: stanceValue },
      { id: ROLE_KEY, value: roleValue },
      { id: PARTY_KEY, value: partyValue },
      { id: STATE_KEY, value: stateValue },
    ],
    [partyValue, roleValue, stanceValue, stateValue],
  )

  const setValue: Dispatch<SetStateAction<ColumnFiltersState>> = useCallback(
    newValue => {
      const valueToSet = typeof newValue === 'function' ? newValue(filters) : newValue

      const newSearchParamValues: MultipleSearchParamConfig = {}

      const newStanceValue = valueToSet.find(filter => filter.id === STANCE_KEY)
      if (newStanceValue?.value) {
        newSearchParamValues[STANCE_KEY] = newStanceValue.value as string
      }

      const newRoleValue = valueToSet.find(filter => filter.id === ROLE_KEY)
      if (newRoleValue?.value) {
        newSearchParamValues[ROLE_KEY] = newRoleValue.value as string
      }

      const newPartyValue = valueToSet.find(filter => filter.id === PARTY_KEY)
      if (newPartyValue?.value) {
        newSearchParamValues[PARTY_KEY] = newPartyValue.value as string
      }

      const newStateValue = valueToSet.find(filter => filter.id === STATE_KEY)
      if (newStateValue?.value) {
        newSearchParamValues[STATE_KEY] = newStateValue.value as string
      }

      setSearchParamValues(newSearchParamValues)
    },
    [filters, setSearchParamValues],
  )

  return [hasHydrated ? filters : [], setValue]
}
