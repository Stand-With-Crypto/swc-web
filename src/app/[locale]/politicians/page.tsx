import {
  PAGE_POLITICIANS_DESCRIPTION,
  PAGE_POLITICIANS_TITLE,
  PagePoliticians,
} from '@/components/app/pagePoliticians'
import { queryDTSIHomepagePeople } from '@/data/dtsi/queries/queryDTSIHomepagePeople'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { Metadata } from 'next'

export const revalidate = 3600
export const dynamic = 'error'

type Props = PageProps

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    description: PAGE_POLITICIANS_DESCRIPTION,
    title: PAGE_POLITICIANS_TITLE,
  })
}

export default async function PoliticiansHomepage({ params }: PageProps) {
  const { locale } = params
  const dtsiHomepagePeople = await queryDTSIHomepagePeople()
  return <PagePoliticians {...{ dtsiHomepagePeople, locale }} />
}
