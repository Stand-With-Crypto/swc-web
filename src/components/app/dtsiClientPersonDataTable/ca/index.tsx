'use client'

import { Suspense, useMemo } from 'react'
import { Column, filterFns } from '@tanstack/react-table'

import {
  getGlobalFilterDefaults,
  getPartyOptionDisplayName,
  getPersonDataTableFilterFns,
  getRoleOptionDisplayName,
  PARTY_OPTIONS,
  ROLE_OPTIONS,
} from '@/components/app/dtsiClientPersonDataTable/ca/filters'
import {
  getDTSIClientPersonDataTableColumns,
  Person,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { GlobalFilters } from '@/components/app/dtsiClientPersonDataTable/common/filters'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/common/table'
import { DataTableSkeleton } from '@/components/app/dtsiClientPersonDataTable/common/tableSkeleton'
import { useGetAllPeople } from '@/components/app/dtsiClientPersonDataTable/common/useGetAllPeople'
import { useSearchFilter } from '@/components/app/dtsiClientPersonDataTable/common/useTableFilters'
import {
  DTSIPersonDataTablePeople,
  parseStringPoliticiansTable,
  sortDTSIPersonDataTable,
} from '@/components/app/dtsiClientPersonDataTable/common/utils'
import { DTSIThumbsUpOrDownGrade } from '@/components/app/dtsiThumbsUpOrDownGrade'
import {
  CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP,
  getCAProvinceOrTerritoryNameFromCode,
} from '@/utils/shared/stateMappings/caProvinceUtils'
import { getTerritoryDivisionByCountryCode } from '@/utils/shared/stateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const GLOBAL_SEARCH_PLACEHOLDER = 'Search by name or province'
const GLOBAL_SUBTITLE =
  'We have a rich database of politicians. Search any politician to see where they stand on crypto.'
const GLOBAL_TITLE = 'Search for a politician'

const countryCode = SupportedCountryCodes.CA

export function CaDTSIClientPersonDataTable({
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
        dtsiGradeComponent: DTSIThumbsUpOrDownGrade,
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
      globalFiltersComponent: CaGlobalFilters,
      globalFilter,
      setGlobalFilter,
    }
  }, [tableColumns, parsedData, globalFilter, setGlobalFilter])

  return (
    <Suspense
      fallback={
        <DataTableSkeleton>
          <DataTableSkeleton.GlobalFilter
            searchPlaceholder={GLOBAL_SEARCH_PLACEHOLDER}
            subtitle={GLOBAL_SUBTITLE}
            title={GLOBAL_TITLE}
          />
          <DataTableSkeleton.Body {...tableBodyProps} loadState={'static'} />
        </DataTableSkeleton>
      }
    >
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
              getCAProvinceOrTerritoryNameFromCode(state)?.toLowerCase().includes(parsedFilterValue)
            )
          }}
          key={data?.people ? 'loaded' : 'static'}
          loadState={data?.people ? 'loaded' : 'static'}
        />
      </DataTable>
    </Suspense>
  )
}

function CaGlobalFilters({ columns }: { columns?: Column<Person>[] }) {
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
      <GlobalFilters.PartySelect
        getPartyOptionDisplayName={getPartyOptionDisplayName}
        namedColumns={namedColumns}
        partyOptions={PARTY_OPTIONS}
      />
      <GlobalFilters.StateSelect
        locationLabel={getTerritoryDivisionByCountryCode(countryCode)}
        namedColumns={namedColumns}
        stateOptions={[
          'All',
          ...Object.keys(CA_PROVINCES_AND_TERRITORIES_CODE_TO_DISPLAY_NAME_MAP).sort(),
        ]}
        triggerClassName="w-[145px]"
      />
    </GlobalFilters>
  )
}
