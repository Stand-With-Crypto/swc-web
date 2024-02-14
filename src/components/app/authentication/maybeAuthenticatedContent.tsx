'use client'

import { useThirdwebData } from '@/hooks/useThirdwebData'

export function MaybeAuthenticatedContent({
  children,
  authenticatedContent,
  loadingFallback,
}: {
  children: React.ReactNode
  authenticatedContent: React.ReactNode
  loadingFallback?: React.ReactNode
}) {
  const { session } = useThirdwebData()

  if (session.isLoading && loadingFallback) {
    return loadingFallback
  }

  if (session.isLoggedIn) {
    return authenticatedContent
  }

  return children
}
