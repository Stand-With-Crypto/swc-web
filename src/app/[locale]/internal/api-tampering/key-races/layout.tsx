import '@/globals.css'

import { notFound } from 'next/navigation'

import { PageProps } from '@/types'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

export default function Layout({ children }: PageProps & { children: React.ReactNode }) {
  if (NEXT_PUBLIC_ENVIRONMENT !== 'local' && NEXT_PUBLIC_ENVIRONMENT !== 'preview') {
    notFound()
  }

  return children
}
