'use client'
import { useMemo } from 'react'
import { sortBy } from 'lodash-es'
import useSWR from 'swr'

import { getDTSIClientPersonDataTableColumns } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/dataTable'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { useLocale } from '@/hooks/useLocale'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

type People = Awaited<ReturnType<typeof queryDTSIAllPeople>>['people']

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
export function DTSIClientPersonDataTable({ initialData }: { initialData: People }) {
  const { data } = useGetAllPeople()
  const locale = useLocale()
  const memoizedColumns = useMemo(() => getDTSIClientPersonDataTableColumns({ locale }), [locale])
  const passedData = useMemo(
    () => sortBy(data?.people || initialData, person => person.promotedPositioning),
    [data, initialData],
  )
  return (
    <DataTable
      columns={memoizedColumns}
      data={passedData}
      key={data?.people ? 'loaded' : 'static'}
      loadState={data?.people ? 'loaded' : 'static'}
    />
  )
}
