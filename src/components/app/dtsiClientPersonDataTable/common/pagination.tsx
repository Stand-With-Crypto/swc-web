import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { times } from 'lodash-es'

import { Button } from '@/components/ui/button'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const pages = Math.ceil(
    table.getFilteredRowModel().rows.length / table.getState().pagination.pageSize,
  )
  const currentPageNumber = table.getState().pagination.pageIndex + 1
  const leftMostVisiblePageNumber =
    currentPageNumber === 1
      ? 1
      : currentPageNumber + 2 > pages
        ? Math.max(pages - 2, 1)
        : currentPageNumber - 1
  const visiblePageNumbers = times(Math.min(3, pages), i => i + leftMostVisiblePageNumber)
  return (
    <div className="flex items-center gap-2">
      <Button
        className="flex h-8 w-8 p-0 disabled:opacity-30"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.setPageIndex(currentPageNumber - 2)}
        variant="secondary"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      {visiblePageNumbers[0] > 1 && (
        <>
          <Button
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(0)}
            variant={1 === currentPageNumber ? 'default' : 'outline'}
          >
            <span className="sr-only">Go to page {1}</span>
            {1}
          </Button>
          {visiblePageNumbers[0] > 2 && <DotsHorizontalIcon />}
        </>
      )}

      {visiblePageNumbers.map(pageNumber => (
        <Button
          className="h-8 w-8 p-0"
          key={pageNumber}
          onClick={() => table.setPageIndex(pageNumber - 1)}
          variant={pageNumber === currentPageNumber ? 'default' : 'outline'}
        >
          <span className="sr-only">Go to page {pageNumber}</span>
          {pageNumber}
        </Button>
      ))}
      {visiblePageNumbers[visiblePageNumbers.length - 1] < pages && (
        <>
          {visiblePageNumbers[visiblePageNumbers.length - 1] + 1 < pages && <DotsHorizontalIcon />}
          <Button
            className="h-8 w-8 p-0"
            onClick={() => table.setPageIndex(pages - 1)}
            variant={pages === currentPageNumber ? 'default' : 'outline'}
          >
            <span className="sr-only">Go to page {pages}</span>
            {pages}
          </Button>
        </>
      )}
      <Button
        className="h-8 w-8 p-0 disabled:opacity-30"
        disabled={!table.getCanNextPage()}
        onClick={() => table.setPageIndex(currentPageNumber)}
        variant="secondary"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
