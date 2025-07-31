import { ChevronLeftIcon, ChevronRightIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
import { times } from 'lodash-es'

import { Button } from '@/components/ui/button'
import { InternalLink } from '@/components/ui/link'
import { cn } from '@/utils/web/cn'

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
        ? Math.max(totalPages - 2, 1)
        : currentPageNumber - 1
  const visiblePageNumbers = times(Math.min(3, totalPages), i => i + leftMostVisiblePageNumber)

  const isFirstPage = currentPageNumber === 1
  const isLastPage = currentPageNumber === totalPages

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        className={cn('h-8 w-8 p-0', {
          'cursor-not-allowed bg-muted hover:bg-muted': isFirstPage,
        })}
        variant="secondary"
      >
        {isFirstPage ? (
          <div>
            <ChevronLeftIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <InternalLink href={getPageUrl(currentPageNumber - 1) || '#'}>
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </InternalLink>
        )}
      </Button>
      {visiblePageNumbers[0] > 1 && (
        <>
          <Button
            asChild
            className="h-8 w-8 p-0"
            variant={1 === currentPageNumber ? 'default' : 'outline'}
          >
            <InternalLink href={getPageUrl(1)} prefetch={false}>
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
          className="h-8 w-8 p-0"
          key={pageNumber}
          variant={pageNumber === currentPageNumber ? 'default' : 'outline'}
        >
          <InternalLink href={getPageUrl(pageNumber)} prefetch={false}>
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
            className="h-8 w-8 p-0"
            variant={totalPages === currentPageNumber ? 'default' : 'outline'}
          >
            <InternalLink href={getPageUrl(totalPages) || '#'} prefetch={false}>
              <span className="sr-only">Go to page {totalPages}</span>
              {totalPages}
            </InternalLink>
          </Button>
        </>
      )}
      <Button
        asChild
        className={cn('h-8 w-8 p-0', {
          'cursor-not-allowed bg-muted opacity-75 hover:bg-muted': isLastPage,
        })}
        variant="secondary"
      >
        {isLastPage ? (
          <div>
            <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <InternalLink href={getPageUrl(currentPageNumber + 1)}>
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </InternalLink>
        )}
      </Button>
    </div>
  )
}
