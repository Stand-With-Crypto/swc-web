import React from 'react'

import { PaginationLinks } from '@/components/ui/paginationLinks'
import { cn } from '@/utils/web/cn'

import { DynamicRecentActivityList } from './dynamicRecentActivityList'
import { RecentActivityList } from './recentActivityList'

export function RecentActivity({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

function RecentActivityFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mt-7 space-x-4 text-center', className)}>{children}</div>
}
RecentActivity.Footer = RecentActivityFooter

RecentActivity.List = RecentActivityList

RecentActivity.DynamicList = DynamicRecentActivityList

function RecentActivityPagination({
  currentPageNumber,
  totalPages,
  getPageUrl,
}: {
  currentPageNumber: number
  totalPages: number
  getPageUrl: (pageNumber: number) => string
}) {
  return (
    <div className="flex justify-center">
      <PaginationLinks
        currentPageNumber={currentPageNumber}
        getPageUrl={pageNumber => {
          if (pageNumber < 1 || pageNumber > totalPages) {
            return ''
          }
          return getPageUrl(pageNumber)
        }}
        totalPages={totalPages}
      />
    </div>
  )
}
RecentActivity.Pagination = RecentActivityPagination
