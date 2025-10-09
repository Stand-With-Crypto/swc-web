'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useSession } from '@/hooks/useSession'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function EuParseLanguageClient() {
  const { user, isLoading } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (user && !isLoading) {
      const path = searchParams?.get('path')

      const language = 'fr' // TODO: get language from user

      const finalPath = path ? `/${language}/${path}` : language

      router.push(`/${SupportedCountryCodes.EU}/${finalPath}?${searchParams?.toString() ?? ''}`)
    }
  }, [user, isLoading, searchParams, router])

  return (
    <div className="fixed left-0 top-0 z-50 h-dvh w-full">
      <LoadingOverlay />
    </div>
  )
}
