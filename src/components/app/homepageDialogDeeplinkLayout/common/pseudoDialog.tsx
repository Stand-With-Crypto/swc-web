import 'server-only'

import React from 'react'
import { X } from 'lucide-react'

import {
  dialogCloseStyles,
  dialogContentStyles,
  dialogOverlayStyles,
} from '@/components/ui/dialog/styles'
import { InternalLink } from '@/components/ui/link'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

export interface PseudoDialogProps extends React.PropsWithChildren {
  countryCode: SupportedCountryCodes
  size?: 'sm' | 'md'
  className?: string
}

export function PseudoDialog({ children, countryCode, size = 'md', className }: PseudoDialogProps) {
  const urls = getIntlUrls(countryCode)
  return (
    <>
      <InternalLink
        className={cn(dialogOverlayStyles, 'cursor-default')}
        href={urls.home()}
        replace
      />
      <div
        className={cn(
          dialogContentStyles,
          size === 'md' && 'max-w-3xl',
          'min-h-[400px]',
          className,
        )}
      >
        <ScrollArea className="overflow-auto md:max-h-[90vh]">{children}</ScrollArea>
        <InternalLink className={dialogCloseStyles} href={urls.home()} replace>
          <X size={20} />
          <span className="sr-only">Close</span>
        </InternalLink>
      </div>
    </>
  )
}
