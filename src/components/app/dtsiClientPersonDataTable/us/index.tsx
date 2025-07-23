'use client'

import { useMemo } from 'react'
import { Column, filterFns } from '@tanstack/react-table'

import {
  getDTSIClientPersonDataTableColumns,
  Person,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { GlobalFilters } from '@/components/app/dtsiClientPersonDataTable/common/filters'
import {
  DataTable,
  type GlobalFiltersProps,
} from '@/components/app/dtsiClientPersonDataTable/common/table'
import { useGetAllPeople } from '@/components/app/dtsiClientPersonDataTable/common/useGetAllPeople'
import { useSearchFilter } from '@/components/app/dtsiClientPersonDataTable/common/useTableFilters'
import {
  DTSIPersonDataTablePeople,
  parseStringPoliticiansTable,
  sortDTSIPersonDataTable,
} from '@/components/app/dtsiClientPersonDataTable/common/utils'
import {
  getGlobalFilterDefaults,
  getPartyOptionDisplayName,
  getPersonDataTableFilterFns,
  getRoleOptionDisplayName,
  PARTY_OPTIONS,
  ROLE_OPTIONS,
} from '@/components/app/dtsiClientPersonDataTable/us/filters'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  getUSStateNameFromStateCode,
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
} from '@/utils/shared/stateMappings/usStateUtils'
import { getTerritoryDivisionByCountryCode } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const GLOBAL_SEARCH_PLACEHOLDER = 'Search by name or state'
const GLOBAL_SUBTITLE =
  'We have a database of over 1,000 politicians. Search any politician to see where they stand on crypto.'
const GLOBAL_TITLE = 'Search for a politician'
const countryCode = SupportedCountryCodes.US

export function UsDTSIClientPersonDataTable({
  initialData,
}: {
  initialData: DTSIPersonDataTablePeople
}) {
  const [globalFilter, setGlobalFilter] = useSearchFilter('')

  const { data } = useGetAllPeople(countryCode, {
    fallbackData: { people: sortDTSIPersonDataTable(initialData) },
    keepPreviousData: true,
  })

  const parsedData = useMemo(() => {
    if (!data?.people) return

    return sortDTSIPersonDataTable(data?.people)
  }, [data?.people])

  const tableColumns = useMemo(
    () =>
      getDTSIClientPersonDataTableColumns({
        countryCode,
        dtsiGradeComponent: DTSIFormattedLetterGrade,
      }),
    [],
  )

  const tableBodyProps = useMemo(() => {
    return {
      columns: tableColumns,
      countryCode,
      data: parsedData,
      getGlobalFilterDefaults,
      getPersonDataTableFilterFns,
      globalFiltersComponent: UsGlobalFilters,
      globalFilter,
      setGlobalFilter,
    }
  }, [tableColumns, parsedData, globalFilter, setGlobalFilter])

  return (
    <DataTable>
      <DataTable.GlobalFilter
        globalFilter={globalFilter}
        searchPlaceholder={GLOBAL_SEARCH_PLACEHOLDER}
        setGlobalFilter={setGlobalFilter}
        subtitle={GLOBAL_SUBTITLE}
        title={GLOBAL_TITLE}
      />
      <DataTable.Body
        {...tableBodyProps}
        globalFilterFn={(row, _, filterValue, addMeta) => {
          const matchesFullName = filterFns.includesString(row, 'fullName', filterValue, addMeta)
          if (matchesFullName) {
            return true
          }

          const state = row.original.primaryRole?.primaryState ?? ''
          if (!state) {
            return false
          }

          const parsedState = parseStringPoliticiansTable(state)
          const parsedFilterValue = parseStringPoliticiansTable(filterValue)
          return (
            parsedState.includes(parsedFilterValue) ||
            getUSStateNameFromStateCode(state)?.toLowerCase().includes(parsedFilterValue)
          )
        }}
        id="table"
        key={data?.people ? 'loaded' : 'static'}
        loadState={data?.people ? 'loaded' : 'static'}
      />
    </DataTable>
  )
}

function UsGlobalFilters({ columns, onResetFilters, isResetButtonDisabled }: GlobalFiltersProps) {
  const namedColumns = useMemo(() => {
    if (!columns) return {}

    const ids: Record<string, Column<Person>> = {}
    columns.forEach(col => {
      const columnId = typeof col.id === 'string' ? col.id : ''
      if (columnId) {
        ids[columnId] = col as Column<Person>
      }
    })
    return ids
  }, [columns])

  if (!columns) return null

  return (
    <GlobalFilters>
      <GlobalFilters.StanceOnCryptoSelect namedColumns={namedColumns} />
      <GlobalFilters.RoleSelect
        getRoleOptionDisplayName={getRoleOptionDisplayName}
        namedColumns={namedColumns}
        roleOptions={ROLE_OPTIONS}
      />
      <GlobalFilters.StateSelect
        getStateOptionDisplayName={getUSStateNameFromStateCode}
        locationLabel={getTerritoryDivisionByCountryCode(countryCode)}
        namedColumns={namedColumns}
        stateOptions={['All', ...Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()]}
      />
      <GlobalFilters.PartySelect
        getPartyOptionDisplayName={getPartyOptionDisplayName}
        namedColumns={namedColumns}
        partyOptions={PARTY_OPTIONS}
      />

      <GlobalFilters.ResetButton disabled={isResetButtonDisabled} onResetFilters={onResetFilters} />
    </GlobalFilters>
  )
}
