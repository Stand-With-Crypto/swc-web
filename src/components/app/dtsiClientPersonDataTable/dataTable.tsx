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
import React, { useMemo } from 'react'
import { ArrowUpDown, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { DataTablePagination } from '@/components/app/dtsiClientPersonDataTable/dataTablePagination'
import { Person } from '@/components/app/dtsiClientPersonDataTable/columns'
import {
  DTSI_PersonPoliticalAffiliationCategory,
  DTSI_PersonRoleCategory,
  DTSI_PersonRoleStatus,
} from '@/data/dtsi/generated'
import { InputWithIcon } from '@/components/ui/inputWIthIcon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  US_STATE_CODE_TO_DISPLAY_NAME_MAP,
  getUSStateNameFromStateCode,
} from '@/utils/shared/usStateUtils'
import {
  getDTSIPersonRoleCategoryDisplayName,
  getFormattedDTSIPersonRoleDateRange,
} from '@/utils/dtsi/dtsiPersonRoleUtils'
import { gl } from 'date-fns/locale'
import { PageTitle } from '@/components/ui/pageTitleText'

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
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

enum StanceOnCryptoOptions {
  PRO_CRYPTO = 'Pro-crypto',
  ANTI_CRYPTO = 'Anti-crypto',
  ALL = 'All',
}

const PARTY_OPTIONS = {
  REPUBLICAN: DTSI_PersonPoliticalAffiliationCategory.REPUBLICAN,
  DEMOCRAT: DTSI_PersonPoliticalAffiliationCategory.DEMOCRAT,
  ALL: 'All',
}
function getPartyOptionDisplayName(party: string) {
  switch (party) {
    case PARTY_OPTIONS.REPUBLICAN:
      return 'Republican'
    case PARTY_OPTIONS.DEMOCRAT:
      return 'Democrat'
    default:
      return 'All'
  }
}

const ROLE_OPTIONS = {
  PRESIDENT: DTSI_PersonRoleCategory.PRESIDENT,
  SENATE: DTSI_PersonRoleCategory.SENATE,
  CONGRESS: DTSI_PersonRoleCategory.CONGRESS,
  ALL: 'All',
}
function getRoleOptionDisplayName(role: string) {
  switch (role) {
    case ROLE_OPTIONS.PRESIDENT:
      return 'National Political Figure'
    case ROLE_OPTIONS.SENATE:
      return 'Senate'
    case ROLE_OPTIONS.CONGRESS:
      return 'House of Reps'
    default:
      return 'All'
  }
}

interface GlobalFilters {
  role: (typeof ROLE_OPTIONS)[keyof typeof ROLE_OPTIONS]
  party: (typeof PARTY_OPTIONS)[keyof typeof PARTY_OPTIONS]
  stance: StanceOnCryptoOptions
  state: 'All' | keyof typeof US_STATE_CODE_TO_DISPLAY_NAME_MAP
}

const getGlobalFilterDefaults = (): GlobalFilters => ({
  role: ROLE_OPTIONS.ALL,
  party: PARTY_OPTIONS.ALL,
  stance: StanceOnCryptoOptions.ALL,
  state: 'All',
})

export function DataTable<TData extends Person, TValue>({
  columns,
  data: passedData,
  loadState,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = React.useState<GlobalFilters>(getGlobalFilterDefaults())
  const stateOptions = useMemo(() => {
    return ['All', ...Object.keys(US_STATE_CODE_TO_DISPLAY_NAME_MAP).sort()]
  }, [])
  const data = useMemo(() => {
    return passedData.filter(x => {
      if (globalFilter.stance !== StanceOnCryptoOptions.ALL) {
        const scoreToUse = x.manuallyOverriddenStanceScore ?? x.computedStanceScore
        const stance =
          !scoreToUse || scoreToUse === 50
            ? StanceOnCryptoOptions.ALL
            : scoreToUse > 50
              ? StanceOnCryptoOptions.PRO_CRYPTO
              : StanceOnCryptoOptions.ANTI_CRYPTO
        if (stance !== globalFilter.stance) {
          return false
        }
      }
      console.log(globalFilter.role !== x.primaryRole?.roleCategory)
      if (
        globalFilter.role !== ROLE_OPTIONS.ALL &&
        globalFilter.role !== x.primaryRole?.roleCategory
      ) {
        return false
      }
      if (
        globalFilter.party !== PARTY_OPTIONS.ALL &&
        globalFilter.party !== x.politicalAffiliationCategory
      ) {
        return false
      }
      console.log(globalFilter.state, x.primaryRole?.primaryState)
      if (globalFilter.state !== 'All' && globalFilter.state !== x.primaryRole?.primaryState) {
        return false
      }
      return true
    })
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
            <InputWithIcon
              className="rounded-full bg-gray-100 text-gray-600"
              icon={<Search className="h-4 w-4 text-gray-500" />}
              value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
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
              placeholder="Search By name"
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
            {/* Styles get a little funky here so we can responsively support sideways scroll with the proper padding on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-3 pr-3 pt-3 md:pb-0 md:pr-0 md:pt-0">
              <Select
                value={globalFilter.stance}
                onValueChange={(stance: StanceOnCryptoOptions) =>
                  setGlobalFilter({ ...globalFilter, stance })
                }
              >
                <SelectTrigger className="w-[195px] flex-shrink-0">
                  <span className="mr-2 inline-block flex-shrink-0 font-bold">
                    Stance on crypto
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(StanceOnCryptoOptions).map(stance => (
                    <SelectItem key={stance} value={stance}>
                      {stance}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={globalFilter.role}
                onValueChange={role => setGlobalFilter({ ...globalFilter, role })}
              >
                <SelectTrigger className="w-[130px] flex-shrink-0">
                  <span className="mr-2 inline-block flex-shrink-0 font-bold">Role</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ROLE_OPTIONS).map(role => (
                    <SelectItem key={role} value={role}>
                      {getRoleOptionDisplayName(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={globalFilter.party}
                onValueChange={party => setGlobalFilter({ ...globalFilter, party })}
              >
                <SelectTrigger className="w-[120px] flex-shrink-0">
                  <span className="mr-2 inline-block flex-shrink-0 font-bold">Party</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(PARTY_OPTIONS).map(party => (
                    <SelectItem key={party} value={party}>
                      {getPartyOptionDisplayName(party)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={globalFilter.state}
                onValueChange={(state: typeof globalFilter.state) =>
                  setGlobalFilter({ ...globalFilter, state })
                }
              >
                <SelectTrigger className="w-[110px] flex-shrink-0">
                  <span className="mr-2 inline-block flex-shrink-0 font-bold">State</span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map(state => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
        {loadState === 'loaded' && (
          <div className="mt-3 flex justify-center">
            <DataTablePagination table={table} />
          </div>
        )}
      </div>
    </div>
  )
}
