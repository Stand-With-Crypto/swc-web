import { PageHome } from '@/components/app/pageHome'
import { getHomepageData } from '@/data/pageSpecific/getHomepageData'
import { PageProps } from '@/types'

export const revalidate = 5
export const dynamic = 'error'

export default async function Home({ params }: PageProps) {
  const asyncProps = await getHomepageData()
  return <PageHome params={params} {...asyncProps} />
}
