'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useIsMobile } from '@/hooks/useIsMobile'
import { externalUrls } from '@/utils/shared/urls'

const languages = getNavigatorLanguages()

export function UKDisclaimerBanner() {
  const hasHydrated = useHasHydrated()
  const router = useRouter()
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = useState(false)
  const [isRendered, setIsRendered] = useState(false)

  const WrapperContainer = isMobile ? 'button' : 'div'

  const handleWrapperClick = () => {
    router.push(externalUrls.ukSWCUrl())
  }

  const showBanner = Boolean(languages?.some(language => language.includes('en-GB')))

  useEffect(() => {
    if (hasHydrated && showBanner) {
      setIsRendered(true)
      setTimeout(() => setIsVisible(true), 10)
    }
  }, [hasHydrated, showBanner])

  return isRendered ? (
    <div
      className={`flex w-full transition-all duration-200 ${isVisible ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <WrapperContainer
        className="flex h-12 w-full items-center bg-primary-cta text-center"
        {...(isMobile && { onClick: handleWrapperClick })}
      >
        <div className="container flex justify-between">
          <div className="w-full space-y-1 text-sm text-background antialiased max-sm:text-center sm:text-base">
            <p>
              Looking for Stand With Crypto UK? Click{' '}
              <strong>
                <Link href={externalUrls.ukSWCUrl()}>here</Link>
              </strong>
            </p>
          </div>
        </div>
      </WrapperContainer>
    </div>
  ) : null
}

/**
 * Return window.navigator.languages
 */
function getNavigatorLanguages() {
  if (typeof window === 'undefined') return null

  return window.navigator.languages
}
