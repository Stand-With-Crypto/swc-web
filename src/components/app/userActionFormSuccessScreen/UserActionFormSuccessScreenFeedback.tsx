import { ReactNode } from 'react'

import { DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO } from '@/components/app/userActionFormSuccessScreen/constants'
import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'

export interface UserActionFormSuccessScreenFeedbackProps {
  image?: ReactNode
  title?: ReactNode
  description?: ReactNode
  isVotingDay?: boolean
}

export function UserActionFormSuccessScreenFeedback(
  props: UserActionFormSuccessScreenFeedbackProps,
) {
  const { image, title, isVotingDay } = props
  const description = isVotingDay
    ? props.description // Temporary description until 2024 election is over.
    : "This year's election is critical to the future of crypto. Here's how to become an informed voter."

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <UserActionFormSuccessScreenFeedback.Image>{image}</UserActionFormSuccessScreenFeedback.Image>

      <div className="space-y-2">
        <UserActionFormSuccessScreenFeedback.Title>
          {title}
        </UserActionFormSuccessScreenFeedback.Title>
        <UserActionFormSuccessScreenFeedback.Description>
          {description}
        </UserActionFormSuccessScreenFeedback.Description>
      </div>
    </div>
  )
}

const UserActionFormSuccessScreenDefaultImage = () => (
  <NextImage
    alt="Shield with checkmark"
    height={120}
    src="/misc/swc-shield-checkmark.svg"
    width={120}
  />
)

UserActionFormSuccessScreenFeedback.Image = function UserActionFormSuccessScreenFeedbackImage({
  children,
}: {
  children: ReactNode
}) {
  return <div className="mx-auto">{children || <UserActionFormSuccessScreenDefaultImage />}</div>
}

UserActionFormSuccessScreenFeedback.Title = function UserActionFormSuccessScreenFeedbackTitle({
  children,
}: {
  children: ReactNode
}) {
  return <PageTitle size="sm">{children || 'Nice work!'}</PageTitle>
}

UserActionFormSuccessScreenFeedback.Description =
  function UserActionFormSuccessScreenFeedbackDescription({ children }: { children: ReactNode }) {
    return (
      <PageSubTitle className="max-w-lg" size="md">
        {children || DEFAULT_USER_ACTION_FORM_SUCCESS_SCREEN_INFO.WITHOUT_NFT}
      </PageSubTitle>
    )
  }

UserActionFormSuccessScreenFeedback.Skeleton =
  function UserActionFormSuccessScreenFeedbackSkeleton() {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <Skeleton className="h-[180px] w-[345px] rounded-xl" />
        <Skeleton className="h-8 w-full max-w-xs" />

        <div className="flex w-full flex-col items-center gap-2">
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>
    )
  }
