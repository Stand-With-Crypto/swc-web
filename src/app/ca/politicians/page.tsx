import { Metadata } from 'next'

import { sortDTSIPersonDataTable } from '@/components/app/dtsiClientPersonDataTable/common/utils'
import {
  CaPagePoliticians,
  PAGE_POLITICIANS_DESCRIPTION,
  PAGE_POLITICIANS_TITLE,
} from '@/components/app/pagePoliticians/ca'
import { queryDTSIAllPeople } from '@/data/dtsi/queries/queryDTSIAllPeople'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'

type Props = PageProps

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return generateMetadataDetails({
    title: PAGE_POLITICIANS_TITLE,
    description: PAGE_POLITICIANS_DESCRIPTION,
  })
}

export default async function PoliticiansHomepage() {
  const results = await queryDTSIAllPeople({ countryCode: SupportedCountryCodes.CA })

  const politicians = sortDTSIPersonDataTable(results.people).slice(0, 100)
  return <CaPagePoliticians {...{ politicians }} />
}
