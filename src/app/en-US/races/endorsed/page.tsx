import { Metadata } from 'next'

import { PageEndorsedCandidates } from '@/components/app/pageEndorsedCandidates'
import { queryDTSIEndorsedCandidates } from '@/data/dtsi/queries/queryDTSIEndorsedCandidates'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'
import { ENDORSED_DTSI_PERSON_SLUGS } from '@/utils/shared/locationSpecificPages'

export const revalidate = 600 // 10 minutes
export const dynamic = 'error'

const title = 'Stand With Crypto PAC 2024 House and Senate Endorsements'
const description =
  '2024 will be a monumental election year and Congress holds the power to shape the future of crypto in the U.S. Stand With Crypto is committed to supporting pro-crypto candidates and we are proud to endorse the candidates on this page.'
export const metadata: Metadata = {
  ...generateMetadataDetails({
    description,
    title,
  }),
}

export default async function AboutPage(props: PageProps) {
  const params = await props.params

  const { locale } = params

  const { people } = await queryDTSIEndorsedCandidates({
    endorsedDTSISlugs: ENDORSED_DTSI_PERSON_SLUGS,
  })
  return <PageEndorsedCandidates {...{ locale, people }} />
}
