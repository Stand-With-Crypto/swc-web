import '@/globals.css'

import { PageProps } from '@/types'

export const fetchCache = 'default-cache'

// This file is needed otherwise the top level not-found will not work
export default function Layout({ children }: PageProps & { children: React.ReactNode }) {
  return children
}
