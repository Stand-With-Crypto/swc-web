'use client'

import { useThirdwebData } from '@/hooks/useThirdwebData'

export function MaybeAuthenticatedContent({
  children,
  authenticatedContent,
}: {
  children: React.ReactNode
  authenticatedContent: React.ReactNode
}) {
  const { session } = useThirdwebData()

  if (session.isLoggedIn) {
    return authenticatedContent
  }

  return children
}
