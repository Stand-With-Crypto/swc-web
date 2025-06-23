'use client'

import { useHasHydrated } from '@/hooks/useHasHydrated'
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
  const hasHydrated = useHasHydrated()

  if ((session.isLoading && loadingFallback) || !hasHydrated) {
    return loadingFallback
  }

  if (session.isLoggedIn && (!useThirdwebSession || session.isLoggedInThirdweb)) {
    return authenticatedContent
  }

  return children
}
