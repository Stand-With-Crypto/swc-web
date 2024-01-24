'use client'
import { getDTSIClientPersonDataTableColumns } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/dataTable'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { SupportedLocale } from '@/intl/locales'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import _ from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'

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
// TODO figure out what we want this to look like on mobile
export function DTSIClientPersonDataTable({
  locale,
  initialData,
}: {
  locale: SupportedLocale
  initialData: People
}) {
  const { data } = useGetAllPeople()
  const memoizedColumns = useMemo(() => getDTSIClientPersonDataTableColumns({ locale }), [locale])
  const passedData = useMemo(
    () => _.sortBy(data?.people || initialData, person => person.promotedPositioning),
    [data, initialData],
  )
  return (
    <DataTable
      loadState={data?.people ? 'loaded' : 'static'}
      key={data?.people ? 'loaded' : 'static'}
      columns={memoizedColumns}
      data={passedData}
    />
  )
}
