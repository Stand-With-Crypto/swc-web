'use client'

import dynamic from 'next/dynamic'

export const CookieConsent = dynamic(() => import('./cookieConsent'), {
  ssr: false,
})
