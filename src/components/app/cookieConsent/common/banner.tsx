'use client'

import { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils/web/cn'

interface CookieConsentBannerProps {
  children: ReactNode
}

export function CookieConsentBanner({ children }: CookieConsentBannerProps) {
  return (
    <div
      className={cn('max-w-screen fixed bottom-0 left-0 z-10 w-full bg-secondary p-3 pb-2 md:p-6')}
    >
      <div className="flex flex-col md:container md:flex-row md:justify-between md:gap-5">
        {children}
      </div>
    </div>
  )
}

const Content = ({ children, onRejectAll }: { children: ReactNode; onRejectAll: () => void }) => {
  return (
    <div className="relative">
      <button
        className="relative right-[-4px] top-[-4px] float-right h-auto px-1 md:static md:hidden"
        onClick={onRejectAll}
      >
        <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
          <X className="h-4 w-4" />
        </div>
      </button>

      {children}
    </div>
  )
}

CookieConsentBanner.Content = Content

const ManageCookiesButton = ({ children }: { children?: ReactNode }) => {
  return (
    <Button className="px-0 py-4" variant="link">
      {children || 'Manage cookies'}
    </Button>
  )
}

CookieConsentBanner.ManageCookiesButton = ManageCookiesButton

const Footer = ({
  children,
  onRejectAll,
  onAcceptAll,
}: {
  children: ReactNode
  onRejectAll: () => void
  onAcceptAll: () => void
}) => {
  return (
    <div className={cn('mb-2 flex items-center justify-between gap-4 md:mb-0 md:justify-end')}>
      <div className="flex gap-4">
        {children}
        <Button className="px-0 py-4" onClick={onRejectAll} variant="link">
          Reject all
        </Button>
      </div>
      <Button
        className="px-4 py-4 font-bold text-primary-cta md:px-0"
        onClick={onAcceptAll}
        variant="link"
      >
        Accept all
      </Button>
      <button className="hidden md:block" onClick={onRejectAll}>
        <div className="rounded-full bg-gray-300 p-1 text-white transition-all hover:bg-gray-400">
          <X className="h-4 w-4" />
        </div>
      </button>
    </div>
  )
}

CookieConsentBanner.Footer = Footer
