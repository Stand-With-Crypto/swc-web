'use client'

import { useMemo } from 'react'
import { Column, filterFns } from '@tanstack/react-table'

import {
  getDTSIClientPersonDataTableColumns,
  Person,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { GlobalFilters } from '@/components/app/dtsiClientPersonDataTable/common/filters'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/common/table'
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
} from '@/components/app/dtsiClientPersonDataTable/gb/filters'
import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import {
  GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP,
  getGBCountryNameFromCode,
} from '@/utils/shared/stateMappings/gbCountryUtils'
import { getTerritoryDivisionByCountryCode } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const GLOBAL_SEARCH_PLACEHOLDER = 'Search by name or country'
const GLOBAL_SUBTITLE =
  'We have a rich database of politicians. Search any politician to see where they stand on crypto.'
const GLOBAL_TITLE = 'Search for a politician'

const countryCode = SupportedCountryCodes.GB

export function GbDTSIClientPersonDataTable({
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
      globalFiltersComponent: GbGlobalFilters,
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
            getGBCountryNameFromCode(state)?.toLowerCase().includes(parsedFilterValue)
          )
        }}
        key={data?.people ? 'loaded' : 'static'}
        loadState={data?.people ? 'loaded' : 'static'}
      />
    </DataTable>
  )
}

function GbGlobalFilters({ columns }: { columns?: Column<Person>[] }) {
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
        getStateOptionDisplayName={getGBCountryNameFromCode}
        locationLabel={getTerritoryDivisionByCountryCode(countryCode)}
        namedColumns={namedColumns}
        stateOptions={['All', ...Object.keys(GB_MAIN_COUNTRY_CODE_TO_DISPLAY_NAME_MAP).sort()]}
        triggerClassName="w-[150px]"
      />
      <GlobalFilters.PartySelect
        getPartyOptionDisplayName={getPartyOptionDisplayName}
        namedColumns={namedColumns}
        partyOptions={PARTY_OPTIONS}
      />
    </GlobalFilters>
  )
}
