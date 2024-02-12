import { PageHome } from '@/components/app/pageHome'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

import { PageProps } from '@/types'

export const revalidate = SECONDS_DURATION.MINUTE
export const dynamic = 'error'

export default async function Home({ params }: PageProps) {
  const asyncProps = await getHomepageData()
  return <PageHome params={params} {...asyncProps} />
}
