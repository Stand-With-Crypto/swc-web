import React from 'react'
import { ArrowLeft } from 'lucide-react'

import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'

interface UserActionFormVoterRegistrationLayoutProps extends React.PropsWithChildren {
  onBack?: () => void
}

export function UserActionFormVoterRegistrationLayout({
  onBack,
  children,
}: UserActionFormVoterRegistrationLayoutProps) {
  return (
    <>
      {onBack && <GoBackButton onClick={onBack} />}
      <div className="flex min-h-[400px] flex-col p-6">{children}</div>
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
UserActionFormVoterRegistrationLayout.Heading = Heading

function Container({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-grow items-center justify-center">
      <div className="space-y-4 p-8 md:space-y-8">{children}</div>
    </div>
  )
}
UserActionFormVoterRegistrationLayout.Container = Container

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className={cn('left-2', dialogButtonStyles)} onClick={onClick} role="button">
      <ArrowLeft size={20} />
    </div>
  )
}

function Footer({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-row-reverse items-center justify-between space-y-4 px-8 md:space-y-8">
      {children}
    </div>
  )
}
UserActionFormVoterRegistrationLayout.Footer = Footer
