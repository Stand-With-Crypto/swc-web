import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import _ from 'lodash'

export function PaginationLinks({
  getPageUrl,
  totalPages,
  currentPageNumber,
}: {
  getPageUrl: (page: number) => string
  totalPages: number
  currentPageNumber: number
}) {
  const leftMostVisiblePageNumber =
    currentPageNumber === 1
      ? 1
      : currentPageNumber + 2 > totalPages
        ? totalPages - 2
        : currentPageNumber - 1
  const visiblePageNumbers = _.times(Math.min(3, totalPages), i => i + leftMostVisiblePageNumber)
  return (
    <div className="flex items-center gap-2">
      <Button asChild className="hidden h-8 w-8 p-0 lg:flex" variant="secondary">
        <InternalLink href={getPageUrl(currentPageNumber - 1) || '#'}>
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </InternalLink>
      </Button>
      {visiblePageNumbers[0] > 1 && (
        <>
          <Button
            asChild
            className="hidden h-8 w-8 p-0 lg:flex"
            variant={1 === currentPageNumber ? 'default' : 'outline'}
          >
            <InternalLink href={getPageUrl(1)}>
              <span className="sr-only">Go to page {1}</span>
              {1}
            </InternalLink>
          </Button>
          {visiblePageNumbers[0] > 2 && <DotsHorizontalIcon />}
        </>
      )}

      {visiblePageNumbers.map(pageNumber => (
        <Button
          asChild
          className="hidden h-8 w-8 p-0 lg:flex"
          key={pageNumber}
          variant={pageNumber === currentPageNumber ? 'default' : 'outline'}
        >
          <InternalLink href={getPageUrl(pageNumber)}>
            <span className="sr-only">Go to page {pageNumber}</span>
            {pageNumber}
          </InternalLink>
        </Button>
      ))}
      {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
        <>
          {visiblePageNumbers[visiblePageNumbers.length - 1] + 1 < totalPages && (
            <DotsHorizontalIcon />
          )}
          <Button
            asChild
            className="hidden h-8 w-8 p-0 lg:flex"
            variant={totalPages === currentPageNumber ? 'default' : 'outline'}
          >
            <InternalLink href={getPageUrl(totalPages) || '#'}>
              <span className="sr-only">Go to page {totalPages}</span>
              {totalPages}
            </InternalLink>
          </Button>
        </>
      )}
      <Button asChild className="hidden h-8 w-8 p-0 lg:flex" variant="secondary">
        <InternalLink href={getPageUrl(currentPageNumber + 1)}>
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </InternalLink>
      </Button>
    </div>
  )
}
