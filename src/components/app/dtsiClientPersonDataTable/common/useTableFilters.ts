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

const roleKey = PERSON_TABLE_COLUMNS_IDS.ROLE
const partyKey = PERSON_TABLE_COLUMNS_IDS.PARTY
const stateKey = PERSON_TABLE_COLUMNS_IDS.STATE
const stanceKey = PERSON_TABLE_COLUMNS_IDS.STANCE

const defaultFiltersValue = 'All'

export function useColumnFilters(): [
  ColumnFiltersState,
  Dispatch<SetStateAction<ColumnFiltersState>>,
] {
  const hasHydrated = useHasHydrated()

  const [searchParamValues, setSearchParamValues] = useMultipleSearchParamState({
    [roleKey]: defaultFiltersValue,
    [partyKey]: defaultFiltersValue,
    [stateKey]: defaultFiltersValue,
    [stanceKey]: defaultFiltersValue,
  })

  const roleValue = searchParamValues[roleKey]
  const partyValue = searchParamValues[partyKey]
  const stateValue = searchParamValues[stateKey]
  const stanceValue = searchParamValues[stanceKey]

  const filters: ColumnFiltersState = useMemo(
    () => [
      { id: stanceKey, value: stanceValue },
      { id: roleKey, value: roleValue },
      { id: partyKey, value: partyValue },
      { id: stateKey, value: stateValue },
    ],
    [partyValue, roleValue, stanceValue, stateValue],
  )

  const setValue: Dispatch<SetStateAction<ColumnFiltersState>> = useCallback(
    newValue => {
      const valueToSet = typeof newValue === 'function' ? newValue(filters) : newValue

      const newSearchParamValues: MultipleSearchParamConfig = {}

      const newStanceValue = valueToSet.find(filter => filter.id === stanceKey)
      if (newStanceValue?.value) {
        newSearchParamValues[stanceKey] = newStanceValue.value as string
      }

      const newRoleValue = valueToSet.find(filter => filter.id === roleKey)
      if (newRoleValue?.value) {
        newSearchParamValues[roleKey] = newRoleValue.value as string
      }

      const newPartyValue = valueToSet.find(filter => filter.id === partyKey)
      if (newPartyValue?.value) {
        newSearchParamValues[partyKey] = newPartyValue.value as string
      }

      const newStateValue = valueToSet.find(filter => filter.id === stateKey)
      if (newStateValue?.value) {
        newSearchParamValues[stateKey] = newStateValue.value as string
      }

      setSearchParamValues(newSearchParamValues)
    },
    [filters, setSearchParamValues],
  )

  return [hasHydrated ? filters : [], setValue]
}
