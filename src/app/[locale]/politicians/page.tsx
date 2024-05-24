import { Metadata } from 'next'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import {
  PAGE_POLITICIANS_DESCRIPTION,
  PAGE_POLITICIANS_TITLE,
  PagePoliticians,
} from '@/components/app/pagePoliticians'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION['10_MINUTES']
export const dynamic = 'error'

type Props = PageProps

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_POLITICIANS_TITLE,
    description: PAGE_POLITICIANS_DESCRIPTION,
  })
}

export default async function PoliticiansHomepage({ params }: PageProps) {
  const { locale } = params
  const results = await queryDTSIAllPeople()

  const people = sortDTSIPersonDataTable(results.people).slice(0, 100)
  return <PagePoliticians {...{ people, locale }} />
}
