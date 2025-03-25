import { Metadata } from 'next'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/sortPeople'
import {
  PAGE_POLITICIANS_DESCRIPTION,
  PAGE_POLITICIANS_TITLE,
  UsPagePoliticians,
} from '@/components/app/pagePoliticians/us'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'

type Props = PageProps

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_POLITICIANS_TITLE,
    description: PAGE_POLITICIANS_DESCRIPTION,
  })
}

export default async function PoliticiansHomepage(props: PageProps) {
  const params = await props.params
  const { countryCode } = params
  const results = await queryDTSIAllPeople({ countryCode })

  const politicians = sortDTSIPersonDataTable(results.people).slice(0, 100)
  return <UsPagePoliticians {...{ politicians, countryCode }} />
}
