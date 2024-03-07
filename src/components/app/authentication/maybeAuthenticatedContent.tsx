'use client'

import { useSession } from '@/hooks/useSession'

export function MaybeAuthenticatedContent({
  children,
  authenticatedContent,
  loadingFallback,
}: {
  children: React.ReactNode
  authenticatedContent: React.ReactNode
  loadingFallback?: React.ReactNode
}) {
  const session = useSession()

  if (session.isLoading && loadingFallback) {
    return loadingFallback
  }

  if (session.isLoggedIn) {
    return authenticatedContent
  }

  return children
}
