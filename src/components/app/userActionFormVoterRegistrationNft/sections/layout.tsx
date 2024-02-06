import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

interface UserActionFormVoterRegistrationNftLayoutProps extends React.PropsWithChildren {
  onBack?: () => void
}

export function UserActionFormVoterRegistrationNftLayout({
  onBack,
  children,
}: UserActionFormVoterRegistrationNftLayoutProps) {
  return (
    <>
      {onBack && <GoBackButton onClick={onBack} />}
      <div className="flex min-h-[400px] flex-col">{children}</div>
    </>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <PageTitle size="sm">{title}</PageTitle>
      <PageSubTitle>{subtitle}</PageSubTitle>
    </div>
  )
}
UserActionFormVoterRegistrationNftLayout.Heading = Heading

function Container({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="space-y-4 md:space-y-8">{children}</div>
    </div>
  )
}
UserActionFormVoterRegistrationNftLayout.Container = Container

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div role="button" onClick={onClick} className={cn('left-2', dialogButtonStyles)}>
      <ArrowLeft size={16} />
    </div>
  )
}

function Footer({ children }: React.PropsWithChildren) {
  return <div className="flex w-full flex-row-reverse items-center justify-between">{children}</div>
}
UserActionFormVoterRegistrationNftLayout.Footer = Footer
