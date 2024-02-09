import React from 'react'
import { ArrowLeft } from 'lucide-react'

import { DtsiCongresspersonDisplay } from '@/components/app/dtsiCongresspersonDisplay'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { UseGetDTSIPeopleFromAddressResponse } from '@/hooks/useGetDTSIPeopleFromAddress'
import { cn } from '@/utils/web/cn'

interface UserActionFormCallCongresspersonLayoutProps extends React.PropsWithChildren {
  onBack?: () => void
}

export function UserActionFormCallCongresspersonLayout({
  onBack,
  children,
}: UserActionFormCallCongresspersonLayoutProps) {
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
UserActionFormCallCongresspersonLayout.Heading = Heading

function Container({ children }: React.PropsWithChildren) {
  return (
    <div className="flex flex-grow">
      <div className="space-y-4 md:space-y-8">{children}</div>
    </div>
  )
}
UserActionFormCallCongresspersonLayout.Container = Container

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div className={cn('left-2', dialogButtonStyles)} onClick={onClick} role="button">
      <ArrowLeft size={16} />
    </div>
  )
}

function CongresspersonDisplayFooter({
  children,
  congressperson,
}: React.PropsWithChildren<{
  congressperson?: UseGetDTSIPeopleFromAddressResponse
}>) {
  return (
    <div className="flex w-full flex-col gap-4 border-t p-6 pt-3 md:flex-row md:items-center md:justify-between md:px-12">
      <DtsiCongresspersonDisplay congressperson={congressperson} />
      {children}
    </div>
  )
}
UserActionFormCallCongresspersonLayout.CongresspersonDisplayFooter = CongresspersonDisplayFooter

function Footer({ children }: React.PropsWithChildren) {
  return <div className="flex w-full flex-row-reverse items-center justify-between">{children}</div>
}
UserActionFormCallCongresspersonLayout.Footer = Footer
