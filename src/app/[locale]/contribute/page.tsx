import { Metadata } from 'next'

import { PageContribute } from '@/components/app/pageContribute'

export const dynamic = 'error'

export const metadata: Metadata = {
  title: 'Contribute',
}

export default async function ContributePage() {
  return <PageContribute />
}
