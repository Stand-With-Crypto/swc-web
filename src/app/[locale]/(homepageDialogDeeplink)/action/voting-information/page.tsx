import { HomepageDialogDeeplinkLayout } from '@/components/app/homepageDialogDeeplinkLayout'
import { UserActionFormVotingInformationDeeplinkWrapper } from '@/components/app/userActionFormVotingInformationResearched/homepageDialogDeeplinkWrapper'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'
import { cn } from '@/utils/web/cn'

export const revalidate = SECONDS_DURATION.HOUR
export const dynamic = 'error'

export default function UserActionVotingInformationDeepLink({ params }: PageProps) {
  return (
    <HomepageDialogDeeplinkLayout pageParams={params}>
      <div className={cn(dialogContentPaddingStyles)}>
        <UserActionFormVotingInformationDeeplinkWrapper />
      </div>
    </HomepageDialogDeeplinkLayout>
  )
}
