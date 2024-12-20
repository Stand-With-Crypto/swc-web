import { Metadata } from 'next'

import { PagePartners } from '@/components/app/pagePartners'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME } from '@/utils/shared/constants'

export const dynamic = 'error'

const title = 'Our partners'
const description = `Stand With Crypto is first and foremost the result of ${TOTAL_CRYPTO_ADVOCATE_COUNT_DISPLAY_NAME}+ people fighting to keep crypto in America. We’ve also partnered with a number of companies to fight alongside us.`

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title,
    description,
  }),
}

export default async function PartnersPage(props: PageProps) {
  const params = await props.params
  return <PagePartners description={description} locale={params.locale} title={title} />
}
