import { DTSIPersonCard } from '@/components/app/dtsiPersonCard'
import { queryDTSIPresidentialCandidates } from '@/data/dtsi/queries/queryDTSIPresidentialCandidates'
import { PageProps } from '@/types'
import { getIntlUrls } from '@/utils/shared/urls'

export const revalidate = 60 * 24 * 7
export const dynamic = 'error'
export const dynamicParams = true

// TODO metadata

export default async function PoliticianDetails({ params }: PageProps<{ dtsiSlug: string }>) {
  return <div className="container">{params.dtsiSlug}</div>
}
