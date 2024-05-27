'use client'
import { ReactNode } from 'react'

import { NextImage } from '@/components/ui/image'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

interface UserActionFormSuccessScreenFeedbackProps {
  Image?: ReactNode
  title: ReactNode
  subtitle: ReactNode
}

export function UserActionFormSuccessScreenFeedback(
  props: UserActionFormSuccessScreenFeedbackProps,
) {
  const { Image, title, subtitle } = props

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <UserActionFormSuccessScreenFeedback.Image>{Image}</UserActionFormSuccessScreenFeedback.Image>
      <UserActionFormSuccessScreenFeedback.Title>{title}</UserActionFormSuccessScreenFeedback.Title>
      <UserActionFormSuccessScreenFeedback.Subtitle>
        {subtitle}
      </UserActionFormSuccessScreenFeedback.Subtitle>
    </div>
  )
}

UserActionFormSuccessScreenFeedback.Image = function UserActionFormSuccessScreenFeedbackImage({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="mx-auto">
      {children || (
        <NextImage alt="Shield with checkmark" height={120} src="/logo/shield.svg" width={120} />
      )}
    </div>
  )
}

UserActionFormSuccessScreenFeedback.Title = function UserActionFormSuccessScreenFeedbackTitle({
  children,
}: {
  children: ReactNode
}) {
  return <PageTitle size="sm">{children || 'Nice work!'}</PageTitle>
}

UserActionFormSuccessScreenFeedback.Subtitle =
  function UserActionFormSuccessScreenFeedbackSubtitle({ children }: { children: ReactNode }) {
    return <PageSubTitle size="md">{children}</PageSubTitle>
  }
