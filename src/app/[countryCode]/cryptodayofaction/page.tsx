import { Metadata } from 'next'

import { PageDayOfAction } from '@/components/app/pageDayOfAction'
import { generateMetadataDetails } from '@/utils/server/metadataUtils'

export const dynamic = 'error'

export const metadata: Metadata = {
  ...generateMetadataDetails({
    title: 'Day of Action',
  }),
}

export default async function DayOfActionPage() {
  return <PageDayOfAction />
}
