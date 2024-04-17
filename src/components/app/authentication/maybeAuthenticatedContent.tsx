'use client'

import { useSession } from '@/hooks/useSession'

export function MaybeAuthenticatedContent({
  children,
  authenticatedContent,
  loadingFallback,
  useThirdwebSession,
}: {
  children: React.ReactNode
  authenticatedContent: React.ReactNode
  loadingFallback?: React.ReactNode
  useThirdwebSession?: boolean
}) {
  const session = useSession()

  if (session.isLoading && loadingFallback) {
    return loadingFallback
  }

  if (session.isLoggedIn && (!useThirdwebSession || session.isLoggedInThirdweb)) {
    return authenticatedContent
  }

  return children
}
