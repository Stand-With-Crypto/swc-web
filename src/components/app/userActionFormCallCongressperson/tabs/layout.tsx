import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'
import { dialogButtonStyles, dialogCloseStyles } from '@/components/ui/dialog/styles'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/web/cn'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

interface UserActionFormCallCongresspersonLayoutProps extends React.PropsWithChildren {
  title: string
  subtitle: string
  onBack?: () => void
}

export function UserActionFormCallCongresspersonLayout({
  title,
  subtitle,
  onBack,
  children,
}: UserActionFormCallCongresspersonLayoutProps) {
  return (
    <>
      {onBack && <GoBackButton onClick={onBack} />}

      <div className="p-6 md:px-12">
        <ScrollArea>
          <div className="space-y-4 md:space-y-8">
            <div className="space-y-2">
              <PageTitle size="sm">{title}</PageTitle>

              <PageSubTitle>{subtitle}</PageSubTitle>
            </div>

            {children}
          </div>
        </ScrollArea>
      </div>
    </>
  )
}

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div role="button" onClick={onClick} className={cn('left-2', dialogButtonStyles)}>
      <ArrowLeft size={16} />
    </div>
  )
}

function Footer({ children }: React.PropsWithChildren) {
  return <div className="flex w-full flex-row-reverse justify-between">{children}</div>
}
UserActionFormCallCongresspersonLayout.Footer = Footer
