'use client'
import React, { useMemo } from 'react'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Search } from 'lucide-react'

import { Person } from '@/components/app/dtsiClientPersonDataTable/columns'
import { DataTablePagination } from '@/components/app/dtsiClientPersonDataTable/dataTablePagination'
import {
  filterDataViaGlobalFilters,
  getGlobalFilterDefaults,
  GlobalFilters,
  PARTY_OPTIONS,
  ROLE_OPTIONS,
  StanceOnCryptoOptions,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loadState: 'loaded' | 'static'
}

export const SortableHeader = <TData, TValue>({
  column,
  children,
}: {
  column: Column<TData, TValue>
  children: React.ReactNode
}) => {
  return (
    <Button
      className="p-0"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      variant="ghost"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export function DataTable<TData extends Person, TValue>({
  columns,
  data: passedData,
  loadState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<GlobalFilters>(getGlobalFilterDefaults())
  const data = useMemo(() => {
    return filterDataViaGlobalFilters<TData>(passedData, globalFilter)
  }, [globalFilter, passedData])
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })
  return (
    <div className="space-y-6">
      <div className="container ">
        <div className="flex flex-col items-center justify-between gap-3 rounded-lg border p-6 md:flex-row">
          <div className="max-w-[400px]">
            <h3 className="text-2xl font-bold">Search for a politician</h3>
            <p className="text-fontcolor-muted">
              We have a database of over 700 politicians. Search any politician to see where they
              stand on crypto.
            </p>
          </div>
          <div className="w-full flex-shrink-0 md:max-w-96">
            <InputWithIcons
              className="rounded-full bg-gray-100 text-gray-600"
              leftIcon={<Search className="h-4 w-4 text-gray-500" />}
              onChange={event => {
                table.getColumn('fullName')?.setFilterValue(event.target.value)
                if (
                  globalFilter.party !== PARTY_OPTIONS.ALL ||
                  globalFilter.role !== ROLE_OPTIONS.ALL ||
                  globalFilter.stance !== StanceOnCryptoOptions.ALL ||
                  globalFilter.state !== 'All'
                ) {
                  setGlobalFilter(getGlobalFilterDefaults())
                }
              }}
              placeholder="Search by name"
              value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
            />
          </div>
        </div>
      </div>
      <div className="md:container">
        <div className="md:min-h-[578px] md:rounded-md md:border">
          <div className="flex flex-col justify-between pl-3 md:flex-row md:p-6">
            <PageTitle className="text-left" size="sm">
              Politicians
            </PageTitle>
            <GlobalFilters {...{ globalFilter, setGlobalFilter }} />
          </div>
          <Table>
            <TableHeader className="bg-gray-100 text-gray-400">
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
                  <TableRow data-state={row.getIsSelected() && 'selected'} key={row.id}>
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
