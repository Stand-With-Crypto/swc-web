'use client'
import { getDTSIClientPersonDataTableColumns } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTable } from '@/components/app/dtsiClientPersonDataTable/dataTable'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { SupportedLocale } from '@/intl/locales'
import { fetchReq } from '@/utils/shared/fetchReq'
import { apiUrls } from '@/utils/shared/urls'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import _ from 'lodash'
import { useMemo } from 'react'
import useSWR from 'swr'

export function useGetAllPeople() {
  return useSWR(apiUrls.dtsiAllPeople(), url =>
    fetchReq(url)
      .then(res => res.json())
      .then(data => data as Awaited<ReturnType<typeof queryDTSIAllPeople>>)
      .catch(catchUnexpectedServerErrorAndTriggerToast),
  )
}
// TODO figure out what we want this to look like on mobile
export function DTSIClientPersonDataTable({ locale }: { locale: SupportedLocale }) {
  const { data } = useGetAllPeople()
  const memoizedColumns = useMemo(() => getDTSIClientPersonDataTableColumns({ locale }), [locale])
  return (
    <div className="container mx-auto py-10">
      {data ? (
        <DataTable columns={memoizedColumns} data={data.people} />
      ) : (
        <div className="min-h-[578px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {_.times(5).map(x => (
                  <TableHead key={x}>
                    <Skeleton className="h-5 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {_.times(10).map(x => (
                <TableRow key={x}>
                  {_.times(5).map(y => (
                    <TableCell key={y}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
