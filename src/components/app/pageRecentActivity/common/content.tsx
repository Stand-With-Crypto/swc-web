import { RecentActivity } from '@/components/app/recentActivity'
import { DynamicRecentActivityListProps } from '@/components/app/recentActivity/dynamicRecentActivityList'
import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'
import { VariantRecentActivityRow } from '@/components/app/recentActivityRow/variantRecentActivityRow'
import { PaginationLinks } from '@/components/ui/paginationLinks'

interface ContentPaginationProps {
  currentPageNumber: number
  getPageUrl: (pageNumber: number) => string
  totalPages: number
}

export function Content({ children }: React.PropsWithChildren) {
  return <>{children}</>
}

function ContentDynamicList(props: DynamicRecentActivityListProps) {
  return <RecentActivity.DynamicList {...props} />
}
Content.DynamicList = ContentDynamicList

function ContentVariantRecentActivityRow(props: RecentActivityRowProps) {
  return <VariantRecentActivityRow {...props} />
}
Content.VariantRecentActivityRow = ContentVariantRecentActivityRow

function ContentPagination({ currentPageNumber, getPageUrl, totalPages }: ContentPaginationProps) {
  return (
    <div className="flex justify-center">
      <PaginationLinks
        currentPageNumber={currentPageNumber}
        getPageUrl={pageNumber =>
          pageNumber < 1 || pageNumber > totalPages ? '' : getPageUrl(pageNumber)
        }
        totalPages={totalPages}
      />
    </div>
  )
}
Content.Pagination = ContentPagination
