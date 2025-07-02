'use client'

import { ComponentType, MouseEvent, ReactNode, SetStateAction, useCallback, useMemo } from 'react'
import {
  Column,
  ColumnFiltersState,
  FilterFn,
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
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

import {
  Person,
  PERSON_TABLE_COLUMNS_IDS,
} from '@/components/app/dtsiClientPersonDataTable/common/columns'
import { DataTablePagination } from '@/components/app/dtsiClientPersonDataTable/common/pagination'
import {
  useColumnFilters,
  useSortingFilter,
} from '@/components/app/dtsiClientPersonDataTable/common/useTableFilters'
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
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'

interface GlobalFiltersProps<TData extends Person = Person> {
  columns?: Column<TData>[]
  onResetFilters: () => void
  isResetButtonDisabled: boolean
}

interface DataTableProps<TData extends Person = Person> extends Partial<TableOptions<TData>> {
  loadState: 'loaded' | 'static'
  countryCode: SupportedCountryCodes
}

export interface DataTableBodyProps<TData extends Person = Person> extends DataTableProps<TData> {
  globalFiltersComponent: ComponentType<GlobalFiltersProps<TData>>
  getGlobalFilterDefaults: () => ColumnFiltersState
  getPersonDataTableFilterFns: () => Record<PERSON_TABLE_COLUMNS_IDS, FilterFn<Person>>
  globalFilter: string
  id?: string
  setGlobalFilter: SetStateAction<any>
}

export function DataTable({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>
}

function DataTableGlobalFilter({
  title,
  subtitle,
  searchPlaceholder = 'Search by name or state',
  globalFilter,
  setGlobalFilter,
}: {
  title: string
  subtitle: string
  searchPlaceholder: string
  globalFilter: string
  setGlobalFilter: SetStateAction<any>
}) {
  const debouncedSetGlobalFilter = useMemo(() => debounce(setGlobalFilter, 300), [setGlobalFilter])

  return (
    <div className="container">
      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border p-6 md:flex-row">
        <div className="max-w-[400px]">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-fontcolor-muted">{subtitle}</p>
        </div>
        <div className="w-full flex-shrink-0 md:max-w-96">
          <InputWithIcons
            className="rounded-full bg-gray-100 text-gray-600"
            defaultValue={globalFilter}
            leftIcon={<Search className="h-4 w-4 text-gray-500" />}
            onChange={event => {
              debouncedSetGlobalFilter(event.target.value)
            }}
            placeholder={searchPlaceholder}
          />
        </div>
      </div>
    </div>
  )
}

DataTable.GlobalFilter = DataTableGlobalFilter

function DataTableBody<TData extends Person = Person>({
  columns = [],
  countryCode,
  data = [],
  getGlobalFilterDefaults,
  getPersonDataTableFilterFns,
  globalFilter,
  globalFilterFn,
  globalFiltersComponent: GlobalFiltersComponent,
  id,
  loadState,
  setGlobalFilter,
  ...rest
}: DataTableBodyProps<TData>) {
  const router = useRouter()

  const [columnFilters, setColumnFilters] = useColumnFilters()

  const [sorting, setSorting] = useSortingFilter([])

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

  const handleTableRowClick = useCallback(
    (event: MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
      const politicianUrl = getIntlUrls(countryCode).politicianDetails(row.original.slug)
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        return window.open(politicianUrl, '_blank')
      }
      return router.push(politicianUrl)
    },
    [countryCode, router],
  )

  const tableRowModel = table.getRowModel()

  const isResetButtonDisabled = useMemo(() => {
    return !columnFilters.some(filter => filter.value !== 'All')
  }, [columnFilters])

  const handleResetFilters = useCallback(() => {
    setColumnFilters(getGlobalFilterDefaults())
  }, [setColumnFilters, getGlobalFilterDefaults])

  return (
    <div className="md:container" id={id}>
      <div className="md:min-h-[578px] md:rounded-md md:border-b md:border-l md:border-r">
        <div className="sticky top-[72px] z-10 flex flex-col justify-between border-b border-t bg-white p-3 pl-3 lg:top-[84px] lg:flex-row lg:p-6">
          <PageTitle className="text-left" size="md">
            Politicians
          </PageTitle>
          <GlobalFiltersComponent
            columns={table.getAllColumns()}
            isResetButtonDisabled={isResetButtonDisabled}
            onResetFilters={handleResetFilters}
          />
        </div>

        <div className="relative w-full">
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
        <div className="mt-3 flex justify-center">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}

DataTable.Body = DataTableBody
