import '@/globals.css'

import { PageProps } from '@/types'

// This file is needed otherwise the top level not-found will not work
export default function Layout({ children }: PageProps & { children: React.ReactNode }) {
  return children
}
