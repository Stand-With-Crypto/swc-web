'use client'

import React, { useMemo } from 'react'
import {
  Column,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table'
import { debounce } from 'lodash-es'
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Person } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTablePagination } from '@/components/app/dtsiClientPersonDataTable/dataTablePagination'
import { getPersonDataTableFilterFns } from '@/components/app/dtsiClientPersonDataTable/filters'
import {
  getGlobalFilterDefaults,
  GlobalFilters,
} from '@/components/app/dtsiClientPersonDataTable/globalFiltersUtils'
import { Button } from '@/components/ui/button'
import { InputWithIcons } from '@/components/ui/inputWithIcons'
import { PageTitle } from '@/components/ui/pageTitleText'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

interface DataTableProps<TData extends Person = Person> extends Partial<TableOptions<TData>> {
  loadState: 'loaded' | 'static'
  locale: SupportedLocale
}

export const SortableHeader = <TData extends Person = Person>({
  column,
  children,
}: {
  column: Column<TData>
  children: React.ReactNode
}) => {
  const sortVal = column.getIsSorted()

  return (
    <Button
      className="p-0"
      onClick={() => {
        !sortVal || sortVal === 'desc'
          ? column.toggleSorting(sortVal !== 'desc')
          : column.clearSorting()
      }}
      variant="ghost"
    >
      {children}
      {!sortVal ? (
        <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />
      ) : sortVal === 'asc' ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUp className="ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

export function DataTable<TData extends Person = Person>({
  columns = [],
  data = [],
  loadState,
  globalFilterFn,
  locale,
  ...rest
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>(getGlobalFilterDefaults())
  const [globalFilter, setGlobalFilter] = React.useState('')
  const router = useRouter()

  const table = useReactTable<TData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 100,
      },
      columnFilters: getGlobalFilterDefaults(),
    },
    filterFns: getPersonDataTableFilterFns(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn,
    ...rest,
  })

  const debouncedSetGlobalFilter = useMemo(() => debounce(setGlobalFilter, 300), [setGlobalFilter])

  return (
    <div className="space-y-6">
      <div className="container ">
        <div className="flex flex-col items-center justify-between gap-3 rounded-lg border p-6 md:flex-row">
          <div className="max-w-[400px]">
            <h3 className="text-2xl font-bold">Search for a politician</h3>
            <p className="text-fontcolor-muted">
              We have a database of over 1,000 politicians. Search any politician to see where they
              stand on crypto.
            </p>
          </div>
          <div className="w-full flex-shrink-0 md:max-w-96">
            <InputWithIcons
              className="rounded-full bg-gray-100 text-gray-600"
              leftIcon={<Search className="h-4 w-4 text-gray-500" />}
              onChange={event => {
                debouncedSetGlobalFilter(event.target.value)
              }}
              placeholder="Search by name or state"
            />
          </div>
        </div>
      </div>
      <div className="md:container">
        <div className="md:min-h-[578px] md:rounded-md md:border-b md:border-l md:border-r">
          <div className="sticky top-[72px] z-10 flex flex-col justify-between border-b border-t bg-white p-3 pl-3 lg:top-[84px] lg:flex-row lg:p-6">
            <PageTitle className="text-left" size="sm">
              Politicians
            </PageTitle>
            <GlobalFilters columns={table.getAllColumns()} />
          </div>
          <Table className="lg:table-fixed">
            <TableHeader className="bg-secondary text-gray-400">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    className="cursor-pointer"
                    data-state={row.getIsSelected() && 'selected'}
                    key={row.id}
                    onClick={() => {
                      router.push(getIntlUrls(locale).politicianDetails(row.original.slug))
                    }}
                    role="button"
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="h-24 text-center" colSpan={columns.length}>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {loadState === 'loaded' && (
          <div className="mt-3 flex justify-center">
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  )
}
