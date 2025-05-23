'use client'

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { ColumnFiltersState, SortingState } from '@tanstack/react-table'

import { PERSON_TABLE_COLUMNS_IDS } from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { StanceOnCryptoOptions } from '@/components/app/dtsiClientPersonDataTable/common/filters'
import { useHasHydrated } from '@/hooks/useHasHydrated'
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

export function useColumnFilters(): [
  ColumnFiltersState,
  Dispatch<SetStateAction<ColumnFiltersState>>,
] {
  const hasHydrated = useHasHydrated()

  const [stanceValue, setStanceValue] = useSearchParamState(
    PERSON_TABLE_COLUMNS_IDS.STANCE,
    StanceOnCryptoOptions.ALL,
  )
  const [roleValue, setRoleValue] = useSearchParamState(PERSON_TABLE_COLUMNS_IDS.ROLE, 'All')
  const [partyValue, setPartyValue] = useSearchParamState(PERSON_TABLE_COLUMNS_IDS.PARTY, 'All')
  const [stateValue, setStateValue] = useSearchParamState(PERSON_TABLE_COLUMNS_IDS.STATE, 'All')

  const filters: ColumnFiltersState = useMemo(
    () => [
      {
        id: PERSON_TABLE_COLUMNS_IDS.STANCE,
        value: stanceValue,
      },
      {
        id: PERSON_TABLE_COLUMNS_IDS.ROLE,
        value: roleValue,
      },
      {
        id: PERSON_TABLE_COLUMNS_IDS.PARTY,
        value: partyValue,
      },
      {
        id: PERSON_TABLE_COLUMNS_IDS.STATE,
        value: stateValue,
      },
    ],
    [partyValue, roleValue, stanceValue, stateValue],
  )

  const setValue: Dispatch<SetStateAction<ColumnFiltersState>> = useCallback(
    newValue => {
      const valueToSet = typeof newValue === 'function' ? newValue(filters) : newValue

      const newStanceValue = valueToSet.find(
        filter => filter.id === PERSON_TABLE_COLUMNS_IDS.STANCE,
      )
      if (newStanceValue?.value) {
        setStanceValue(newStanceValue.value as string)
      }

      const newRoleValue = valueToSet.find(filter => filter.id === PERSON_TABLE_COLUMNS_IDS.ROLE)
      if (newRoleValue?.value) {
        setRoleValue(newRoleValue.value as string)
      }

      const newPartyValue = valueToSet.find(filter => filter.id === PERSON_TABLE_COLUMNS_IDS.PARTY)
      if (newPartyValue?.value) {
        setPartyValue(newPartyValue.value as string)
      }

      const newStateValue = valueToSet.find(filter => filter.id === PERSON_TABLE_COLUMNS_IDS.STATE)
      if (newStateValue?.value) {
        setStateValue(newStateValue.value as string)
      }
    },
    [filters, setPartyValue, setRoleValue, setStanceValue, setStateValue],
  )

  return [hasHydrated ? filters : [], setValue]
}
