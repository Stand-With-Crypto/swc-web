import React, { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'

import { DtsiCongresspersonDisplay } from '@/components/app/dtsiCongresspersonDisplay'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Skeleton } from '@/components/ui/skeleton'
import { DTSIPeopleFromCongressionalDistrict } from '@/hooks/useGetDTSIPeopleFromUSAddress'
import { cn } from '@/utils/web/cn'

interface UserActionFormLayoutProps extends React.PropsWithChildren {
  onBack?: () => void
  className?: string
}

export function UserActionFormLayout({ onBack, className, children }: UserActionFormLayoutProps) {
  return (
    <>
      {onBack && <GoBackButton onClick={onBack} />}

      <div className={cn('flex h-full min-h-[400px] flex-col', className)}>{children}</div>
    </>
  )
}

function Heading({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <PageTitle size="sm">{title}</PageTitle>

      {subtitle && <PageSubTitle>{subtitle}</PageSubTitle>}
    </div>
  )
}
UserActionFormLayout.Heading = Heading

function HeadingSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-2">
      <Skeleton>
        <PageTitle size="sm">{title}</PageTitle>
      </Skeleton>
      <Skeleton>
        <PageSubTitle>{subtitle}</PageSubTitle>
      </Skeleton>
    </div>
  )
}
UserActionFormLayout.HeadingSkeleton = HeadingSkeleton

function Container({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className="flex flex-grow max-md:max-h-full">
      {/* without w-full, on iOS, this won't take up the full width of the parent ¯\_(ツ)_/¯ */}
      <div className={cn('flex h-full w-full flex-col space-y-4 md:space-y-8', className)}>
        {children}
      </div>
    </div>
  )
}
UserActionFormLayout.Container = Container

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div
      className={cn('left-2', dialogButtonStyles)}
      data-testid="action-form-back-button"
      onClick={onClick}
      role="button"
    >
      <ArrowLeft size={20} />
    </div>
  )
}

function CongresspersonDisplayFooter({
  children,
  dtsiPeopleResponse,
  maxPeopleDisplayed,
}: React.PropsWithChildren<{
  maxPeopleDisplayed?: number
  dtsiPeopleResponse?: DTSIPeopleFromCongressionalDistrict
}>) {
  return (
    <div className="z-10 mt-auto flex w-full flex-col gap-4 border-t bg-background p-6 pb-0 pt-3 md:flex-row md:items-center md:justify-between md:px-12">
      <DtsiCongresspersonDisplay
        dtsiPeopleResponse={dtsiPeopleResponse}
        maxPeopleDisplayed={maxPeopleDisplayed}
      />
      {children}
    </div>
  )
}
UserActionFormLayout.CongresspersonDisplayFooter = CongresspersonDisplayFooter

function Footer({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn('flex w-full flex-row-reverse items-center justify-between gap-4', className)}
    >
      {children}
    </div>
  )
}
UserActionFormLayout.Footer = Footer
