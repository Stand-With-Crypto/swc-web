'use client'

import { Suspense, useMemo } from 'react'
import { filterFns } from '@tanstack/react-table'
import useSWR, { SWRConfiguration } from 'swr'

import { getDTSIClientPersonDataTableColumns } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTable, DataTableSkeleton } from '@/components/app/dtsiClientPersonDataTable/dataTable'
import {
  DTSIPersonDataTablePeople,
  sortDTSIPersonDataTable,
} from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { useLocale } from '@/hooks/useLocale'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

const parseString = (str: string) => str.toLowerCase().trim()

/*
To prevent excessive initial page load size, we lazy load the majority of the data for this page via api endpoint.
The static data is just the first "screen" of the politicians table
*/
function useGetAllPeople(options?: SWRConfiguration) {
  return useSWR(
    apiUrls.dtsiAllPeople(),
    url =>
      fetchReq(url)
        .then(res => res.json())
        .then(data => data as Awaited<ReturnType<typeof queryDTSIAllPeople>>)
        .catch(catchUnexpectedServerErrorAndTriggerToast),
    options,
  )
}

export function DTSIClientPersonDataTable({
  initialData,
}: {
  initialData: DTSIPersonDataTablePeople
}) {
  const { data } = useGetAllPeople({
    fallbackData: { people: sortDTSIPersonDataTable(initialData) },
    keepPreviousData: true,
  })
  const locale = useLocale()

  const passedData = useMemo(() => {
    if (!data?.people) return

    return sortDTSIPersonDataTable(data?.people)
  }, [data?.people])

  const tableColumns = useMemo(() => getDTSIClientPersonDataTableColumns({ locale }), [locale])

  return (
    <Suspense fallback={<DataTableSkeleton columns={tableColumns} data={passedData} />}>
      <DataTable
        columns={tableColumns}
        data={passedData}
        globalFilterFn={(row, _, filterValue, addMeta) => {
          const matchesFullName = filterFns.includesString(row, 'fullName', filterValue, addMeta)
          if (matchesFullName) {
            return true
          }

          const state = row.original.primaryRole?.primaryState ?? ''
          if (!state) {
            return false
          }

          const parsedState = parseString(state)
          const parsedFilterValue = parseString(filterValue)
          return (
            parsedState.includes(parsedFilterValue) ||
            getUSStateNameFromStateCode(state)?.toLowerCase().includes(parsedFilterValue)
          )
        }}
        key={data?.people ? 'loaded' : 'static'}
        loadState={data?.people ? 'loaded' : 'static'}
        locale={locale}
      />
    </Suspense>
  )
}
