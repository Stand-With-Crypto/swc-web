'use client'

import { isBuilderPage } from '@/utils/server/builder/models/page/utils/isBuilderPage'
import { usePathname } from 'next/navigation'

export function MaybeBuilderContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (isBuilderPage(pathname)) return null

  return children
}
