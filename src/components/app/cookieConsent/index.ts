'use client'

import dynamic from 'next/dynamic'

export const CookieConsent = dynamic(
  () => import('./cookieConsent').then(mod => mod.CookieConsent),
  {
    ssr: false,
  },
)
