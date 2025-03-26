import { Suspense, useMemo } from 'react'
import { Column, ColumnDef, filterFns } from '@tanstack/react-table'

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
import { GlobalFilters } from '@/components/app/dtsiClientPersonDataTable/common/commonGlobalFiltersUtils'
import {
  DataTable,
  DataTableSkeleton,
} from '@/components/app/dtsiClientPersonDataTable/common/dataTable'
import {
  DTSIPersonDataTablePeople,
  sortDTSIPersonDataTable,
} from '@/components/app/dtsiClientPersonDataTable/common/sortPeople'
import { useGetAllPeople } from '@/components/app/dtsiClientPersonDataTable/common/useGetAllPeople'
import { useSearchFilter } from '@/components/app/dtsiClientPersonDataTable/common/useTableFilters'
import { parseStringPoliticiansTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import {
  CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP,
  getCanadaStateNameFromStateCode,
} from '@/utils/shared/caStateUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

const GLOBAL_SEARCH_PLACEHOLDER = 'Search by name or state'
const GLOBAL_SUBTITLE = 'Search for a politician'
const GLOBAL_TITLE = 'Politicians'

type PersonTableColumn = ColumnDef<Person, unknown>

export function CaDTSIClientPersonDataTable({
  initialData,
}: {
  initialData: DTSIPersonDataTablePeople
}) {
  const [globalFilter, setGlobalFilter] = useSearchFilter('')
  const countryCode = SupportedCountryCodes.CA

  const { data } = useGetAllPeople(countryCode, {
    fallbackData: { people: sortDTSIPersonDataTable(initialData) },
    keepPreviousData: true,
  })

  const parsedData = useMemo(() => {
    if (!data?.people) return

    return sortDTSIPersonDataTable(data?.people)
  }, [data?.people])

  const tableColumns = useMemo(
    () => getDTSIClientPersonDataTableColumns({ countryCode }) as PersonTableColumn[],
    [countryCode],
  )

  const tableBodyProps = useMemo(() => {
    return {
      columns: tableColumns,
      countryCode,
      data: parsedData,
      getGlobalFilterDefaults,
      getPersonDataTableFilterFns,
      globalFilters: <CaGlobalFilters columns={tableColumns} />,
    }
  }, [tableColumns, parsedData, countryCode])

  return (
    <Suspense
      fallback={
        <DataTableSkeleton>
          <DataTableSkeleton.DataTableGlobalFilterSkeleton
            searchPlaceholder={GLOBAL_SEARCH_PLACEHOLDER}
            subtitle={GLOBAL_SUBTITLE}
            title={GLOBAL_TITLE}
          />
          <DataTableSkeleton.DataTableBodySkeleton {...tableBodyProps} loadState={'static'} />
        </DataTableSkeleton>
      }
    >
      <DataTable>
        <DataTable.DataTableGlobalFilter
          globalFilter={globalFilter}
          searchPlaceholder={GLOBAL_SEARCH_PLACEHOLDER}
          setGlobalFilter={setGlobalFilter}
          subtitle={GLOBAL_SUBTITLE}
          title={GLOBAL_TITLE}
        />
        <DataTable.DataTableBody
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
              getCanadaStateNameFromStateCode(state)?.toLowerCase().includes(parsedFilterValue)
            )
          }}
          key={data?.people ? 'loaded' : 'static'}
          loadState={data?.people ? 'loaded' : 'static'}
        />
      </DataTable>
    </Suspense>
  )
}

function CaGlobalFilters({ columns }: { columns: PersonTableColumn[] }) {
  const namedColumns = useMemo(() => {
    const ids: Record<string, Column<Person>> = {}
    columns.forEach(col => {
      const columnId = typeof col.id === 'string' ? col.id : ''
      if (columnId) {
        ids[columnId] = col as Column<Person>
      }
    })
    return ids
  }, [columns])

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
        namedColumns={namedColumns}
        stateOptions={Object.values(CANADA_STATE_CODE_TO_DISPLAY_NAME_MAP)}
      />
    </GlobalFilters>
  )
}
