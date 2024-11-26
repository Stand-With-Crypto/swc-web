'use client'

import React, { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useIntersection } from 'react-use'
import {
  Column,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
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
import {
  useColumnFilters,
  useGlobalFilter,
  useSortingFilter,
} from '@/components/app/dtsiClientPersonDataTable/useTableFilters'
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
import { useWindowEventListeners } from '@/hooks/useWindowEventListeners'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

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
  const [columnFilters, setColumnFilters] = useColumnFilters()
  const [globalFilter, setGlobalFilter] = useGlobalFilter()
  const [sorting, setSorting] = useSortingFilter()

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

  const paginationRef = useRef<HTMLDivElement>(null)
  const filterContainerRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const searchContainerIntersection = useIntersection(searchContainerRef, {
    root: null,
    rootMargin: filterContainerRef.current
      ? `${filterContainerRef.current.offsetHeight + 20}px`
      : '20px',
    threshold: 1,
  })

  const paginationIntersection = useIntersection(paginationRef, {
    root: null,
    rootMargin: '20px',
    threshold: 1,
  })

  const isSearchContainerVisible = searchContainerIntersection?.intersectionRatio === 1
  const isPaginationVisible = paginationIntersection?.intersectionRatio === 1

  const filterContainerBoundingRect = filterContainerRef.current?.getBoundingClientRect()
  const currentFilterContainerYPx = filterContainerBoundingRect
    ? filterContainerBoundingRect.top + filterContainerBoundingRect.height
    : 0

  const shouldShowFixedHeader = !isSearchContainerVisible && !isPaginationVisible

  const headerRefs = useRef<HTMLTableCellElement[]>([])
  const [headerWidths, setHeaderWidths] = useState<number[]>([])

  useEffect(() => {
    const maxRefs = columns.length

    if (headerRefs.current.length > maxRefs) {
      headerRefs.current = headerRefs.current.slice(0, maxRefs)
    }
  }, [headerWidths, columns.length])

  const handleResize = useCallback(() => {
    if (headerRefs.current.length) {
      const widths = headerRefs.current.map(ref => ref.getBoundingClientRect().width)
      setHeaderWidths(widths)
    }
  }, [])

  useWindowEventListeners(['resize', 'scroll'], handleResize)

  const handleTableRowClick = useCallback(
    (event: MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
      const politicianUrl = getIntlUrls(locale).politicianDetails(row.original.slug)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        return window.open(politicianUrl, '_blank')
      }
      return router.push(politicianUrl)
    },
    [locale, router],
  )

  const tableRowModel = table.getRowModel()

  return (
    <div className="space-y-6">
      <div className="container" ref={searchContainerRef}>
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
              defaultValue={globalFilter}
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
          <div
            className="sticky top-[72px] z-10 flex flex-col justify-between border-b border-t bg-white p-3 pl-3 lg:top-[84px] lg:flex-row lg:p-6"
            ref={filterContainerRef}
          >
            <PageTitle className="text-left" size="sm">
              Politicians
            </PageTitle>
            <GlobalFilters columns={table.getAllColumns()} />
          </div>
          <div className="relative w-full">
            <Table className="lg:table-fixed">
              <TableHeader
                className={cn(
                  'bg-secondary text-gray-400',
                  shouldShowFixedHeader && 'fixed z-20 w-full',
                )}
                style={{
                  top: shouldShowFixedHeader ? `${currentFilterContainerYPx}px` : 'auto',
                  width: shouldShowFixedHeader
                    ? headerWidths.reduce((acc, curr) => acc + curr, 0)
                    : 'auto',
                }}
              >
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead
                          key={header.id}
                          ref={el => {
                            if (el) {
                              headerRefs.current.push(el)
                            }
                          }}
                          style={{
                            width: shouldShowFixedHeader ? headerWidths[header.index] : 'auto',
                          }}
                        >
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
                {tableRowModel.rows?.length ? (
                  tableRowModel.rows.map(row => (
                    <TableRow
                      className="cursor-pointer"
                      data-state={row.getIsSelected() && 'selected'}
                      key={row.id}
                      onClick={event => handleTableRowClick(event, row)}
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
        </div>
        {loadState === 'loaded' && (
          <div className="mt-3 flex justify-center" ref={paginationRef}>
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  )
}
