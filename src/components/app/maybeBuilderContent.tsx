'use client'

import { usePathname } from 'next/navigation'

import { isBuilderPage } from '@/utils/server/builder/models/page/utils/isBuilderPage'

export function MaybeBuilderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isBuilderPage(pathname)) return null

  return children
}
