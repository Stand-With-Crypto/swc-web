import { PageResources } from '@/components/app/pageResources'
import { PageProps } from '@/types'

export const dynamic = 'error'

type Props = PageProps

export default async function ResourcesPage(_props: Props) {
  return <PageResources />
}
