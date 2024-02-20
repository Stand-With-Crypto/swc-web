import { PageVote } from '@/components/app/pageVote'
import { PageProps } from '@/types'

export const dynamic = 'error'

export default async function ResourcesPage({ params }: PageProps) {
  return <PageVote params={params} />
}
