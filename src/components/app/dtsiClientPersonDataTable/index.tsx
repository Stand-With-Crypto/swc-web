'use client'
import { useMemo } from 'react'
import { isNil } from 'lodash-es'
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
  const passedData = useMemo(() => {
    const results = [...(data?.people || initialData)]
    results.sort((personA, personB) => {
      if (personA.promotedPositioning) {
        if (personB.promotedPositioning) {
          return personA.promotedPositioning - personB.promotedPositioning
        }
        return -1
      } else if (personB.promotedPositioning) {
        return -1
      }
      if (personA.promotedPositioning === personB.promotedPositioning) {
        const aScore = personA.manuallyOverriddenStanceScore || personA.computedStanceScore
        const bScore = personB.manuallyOverriddenStanceScore || personB.computedStanceScore
        if (aScore === bScore) {
          return 0
        }
        if (isNil(aScore)) {
          return isNil(bScore) ? 0 : 1
        }
        if (isNil(bScore)) {
          return -1
        }
        return bScore - aScore
      }

      return 0
    })
    return results
  }, [data, initialData])
  return (
    <DataTable
      columns={memoizedColumns}
      data={passedData}
      key={data?.people ? 'loaded' : 'static'}
      loadState={data?.people ? 'loaded' : 'static'}
    />
  )
}
