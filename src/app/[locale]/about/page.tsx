import { PageTitle } from '@/components/ui/pageTitleText'
import { PageProps } from '@/types'

export const dynamic = 'error'

type Props = PageProps

export default async function AboutPage({ params }: Props) {
  return (
    <div className="container">
      <PageTitle>TODO</PageTitle>
    </div>
  )
}
