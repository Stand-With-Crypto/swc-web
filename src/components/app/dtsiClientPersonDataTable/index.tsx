'use client'
import { useMemo } from 'react'
import { filterFns } from '@tanstack/react-table'
import useSWR from 'swr'

import { getDTSIClientPersonDataTableColumns } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/dataTable'
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

/*
To prevent excessive initial page load size, we lazy load the majority of the data for this page via api endpoint.
The static data is just the first "screen" of the politicians table
*/

export function useGetAllPeople() {
  return useSWR(apiUrls.dtsiAllPeople(), url =>
    fetchReq(url)
      .then(res => res.json())
      .then(data => data as Awaited<ReturnType<typeof queryDTSIAllPeople>>)
      .catch(catchUnexpectedServerErrorAndTriggerToast),
  )
}
export function DTSIClientPersonDataTable({
  initialData,
}: {
  initialData: DTSIPersonDataTablePeople
}) {
  const { data } = useGetAllPeople()
  const locale = useLocale()
  const memoizedColumns = useMemo(() => getDTSIClientPersonDataTableColumns({ locale }), [locale])
  const passedData = useMemo(() => {
    return sortDTSIPersonDataTable(data?.people || initialData)
  }, [data?.people, initialData])

  const parseString = (str: string) => str.toLowerCase().trim()
  return (
    <DataTable
      columns={memoizedColumns}
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
  )
}
