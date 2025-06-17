import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'

import { RevalidateButton } from './revalidateButton'

export const revalidate = 30
export const dynamic = 'error'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export default async function PerfDebug() {
  await wait(5000)

  return (
    <div className="container flex flex-col gap-4">
      <PageTitle>PerfDebug</PageTitle>
      <PageSubTitle>
        Refreshed at: <strong>{new Date().toISOString()}</strong>
      </PageSubTitle>
      <div className="mx-auto">
        <RevalidateButton />
      </div>
    </div>
  )
}
