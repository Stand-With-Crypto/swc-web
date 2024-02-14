import { PageHome } from '@/components/app/pageHome'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'
import { SECONDS_DURATION } from '@/utils/shared/seconds'

export const revalidate = SECONDS_DURATION.MINUTE
export const dynamic = 'error'

export default async function Home({ params }: PageProps) {
  const asyncProps = await getHomepageData()
  return <PageHome params={params} {...asyncProps} />
}
