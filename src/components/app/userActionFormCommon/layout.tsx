import { ArrowLeft } from 'lucide-react'
import React from 'react'

import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/web/cn'
import { DtsiCongresspersonDisplay } from '@/components/app/dtsiCongresspersonDisplay'
import { UseGetDTSIPeopleFromAddressResponse } from '@/hooks/useGetDTSIPeopleFromAddress'

interface UserActionFormLayoutProps extends React.PropsWithChildren {
  onBack?: () => void
}

export function UserActionFormLayout({ onBack, children }: UserActionFormLayoutProps) {
  return (
    <>
      {onBack && <GoBackButton onClick={onBack} />}

      <div className="min-h-64 p-6 md:px-12">{children}</div>
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
UserActionFormLayout.Heading = Heading

function Container({ children }: React.PropsWithChildren) {
  return (
    <ScrollArea>
      <div className="space-y-4 md:space-y-8">{children}</div>
    </ScrollArea>
  )
}
UserActionFormLayout.Container = Container

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div role="button" onClick={onClick} className={cn('left-2', dialogButtonStyles)}>
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
    <div className="flex w-full items-center justify-between border-t p-6 pt-3 md:px-12">
      <DtsiCongresspersonDisplay congressperson={congressperson} />
      {children}
    </div>
  )
}
UserActionFormLayout.CongresspersonDisplayFooter = CongresspersonDisplayFooter

function Footer({ children }: React.PropsWithChildren) {
  return <div className="flex w-full flex-row-reverse items-center justify-between">{children}</div>
}
UserActionFormLayout.Footer = Footer
