import { Metadata } from 'next'

import { PageResources } from '@/components/app/pageResources'
import { PageProps } from '@/types'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

type Props = PageProps

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Resources',
  }),
}

export default async function ResourcesPage(props: Props) {
  return <PageResources locale={props.params.locale} />
}
