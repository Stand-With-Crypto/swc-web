'use client'
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import React from 'react'
import { ArrowUpDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/app/dtsiClientPersonDataTable/dataTablePagination'
import { Person } from '@/components/app/dtsiClientPersonDataTable/columns'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
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
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

enum GlobalFilter {
  PRO_CRYPTO = 'Pro-crypto',
  ANTI_CRYPTO = 'Anti-crypto',
  REPUBLICAN = 'Republican',
  DEMOCRAT = 'Democrat',
  PRESIDENT = 'Political figure',
  SENATOR = 'Senator',
  REPRESENTATIVE = 'Representative',
}

export function DataTable<TData extends Person, TValue>({
  columns,
  data: passedData,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<GlobalFilter | null>(null)
  const [data, setData] = React.useState<TData[]>(passedData)
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
      <div className="flex justify-center">
        <Input
          placeholder="Search By State"
          value={
            (table.getColumn('primaryStateCodeWithDisplayName')?.getFilterValue() as string) ?? ''
          }
          onChange={event =>
            table.getColumn('primaryStateCodeWithDisplayName')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {[
          {
            type: GlobalFilter.PRO_CRYPTO,
            onClick: () => {
              setData(
                passedData.filter(x =>
                  x.manuallyOverriddenStanceScore
                    ? x.manuallyOverriddenStanceScore > 50
                    : x.computedStanceScore
                      ? x.computedStanceScore > 50
                      : null,
                ),
              )
            },
          },
          {
            type: GlobalFilter.ANTI_CRYPTO,
            onClick: () => {
              setData(
                passedData.filter(x =>
                  x.manuallyOverriddenStanceScore
                    ? x.manuallyOverriddenStanceScore < 50
                    : x.computedStanceScore
                      ? x.computedStanceScore < 50
                      : null,
                ),
              )
            },
          },
          {
            type: GlobalFilter.REPUBLICAN,
            onClick: () => {
              setData(
                passedData.filter(
                  x =>
                    x.politicalAffiliationCategory ===
                    DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
                ),
              )
            },
          },
          {
            type: GlobalFilter.DEMOCRAT,
            onClick: () => {
              setData(
                passedData.filter(
                  x =>
                    x.politicalAffiliationCategory ===
                    DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
                ),
              )
            },
          },
          {
            type: GlobalFilter.PRESIDENT,
            onClick: () => {
              setData(
                passedData.filter(
                  x =>
                    x.primaryRole?.primaryCountryCode === 'US' &&
                    x.primaryRole.roleCategory === DTSI_PersonRoleCategory.PRESIDENT,
                ),
              )
            },
          },
          {
            type: GlobalFilter.SENATOR,
            onClick: () => {
              setData(
                passedData.filter(
                  x =>
                    x.primaryRole?.primaryCountryCode === 'US' &&
                    x.primaryRole.roleCategory === DTSI_PersonRoleCategory.SENATE &&
                    x.primaryRole.status === DTSI_PersonRoleStatus.HELD,
                ),
              )
            },
          },
          {
            type: GlobalFilter.REPRESENTATIVE,
            onClick: () => {
              setData(
                passedData.filter(
                  x =>
                    x.primaryRole?.primaryCountryCode === 'US' &&
                    x.primaryRole.roleCategory === DTSI_PersonRoleCategory.CONGRESS &&
                    x.primaryRole.status === DTSI_PersonRoleStatus.HELD,
                ),
              )
            },
          },
        ].map(({ type, onClick }, i) => (
          <Button
            className="border-2 border-black font-bold"
            variant={type === globalFilter ? 'default' : 'outline'}
            onClick={() => {
              if (type === globalFilter) {
                setGlobalFilter(null)
                setData(passedData)
              } else {
                setGlobalFilter(type)
                onClick()
              }
            }}
            key={i}
          >
            {type}
          </Button>
        ))}
      </div>
      <div className="min-h-[578px] rounded-md border">
        <Table>
          <TableHeader>
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-center">
        <DataTablePagination table={table} />
      </div>
    </div>
  )
}
