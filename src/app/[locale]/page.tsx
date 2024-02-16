import { notFound } from 'next/navigation'

import { PageHome } from '@/components/app/pageHome'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { ORDERED_SUPPORTED_LOCALES } from '@/intl/locales'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.MINUTE
export const dynamic = 'error'

export default async function Home({ params }: PageProps) {
  const asyncProps = await getHomepageData()
  /*
  the locale check in layout works for most cases, but for some reason if we hit 
  a path that includes a "." like /requestProvider.js.map nextjs will try to render the page with that as the locality
  Adding this check here fixes that issue
  */
  if (!ORDERED_SUPPORTED_LOCALES.includes(params.locale)) {
    notFound()
  }
  return <PageHome params={params} {...asyncProps} />
}
