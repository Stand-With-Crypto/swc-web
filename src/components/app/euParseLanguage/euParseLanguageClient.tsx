'use client'

import { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useSession } from '@/hooks/useSession'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { DEFAULT_EU_LANGUAGE } from '@/utils/shared/supportedLocales'

const REDIRECT_TIMEOUT = 7000

export function EuParseLanguageClient() {
  const { user, isLoading } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()

  const path = searchParams?.get('path')

  const handleRedirect = useCallback(() => {
    const language = user?.language || DEFAULT_EU_LANGUAGE
    const finalPath = path ? `${language}/${path}` : language

    router.push(`/${SupportedCountryCodes.EU}/${finalPath}?${searchParams?.toString() ?? ''}`)
  }, [user, path, searchParams, router])

  useEffect(() => {
    if (user && !isLoading) {
      handleRedirect()
    }
  }, [user, isLoading, handleRedirect])

  useEffect(() => {
    const timeout = setTimeout(handleRedirect, REDIRECT_TIMEOUT)

    return () => {
      clearTimeout(timeout)
    }
  }, [handleRedirect])

  return (
    <div className="fixed left-0 top-0 z-50 h-dvh w-full">
      <LoadingOverlay />
    </div>
  )
}
