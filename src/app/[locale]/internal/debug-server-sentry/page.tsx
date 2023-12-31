import { sleep } from '@/utils/shared/sleep'

export const dynamic = 'force-dynamic'

const mockError = () =>
  sleep(1000).then(() => {
    throw new Error('mock error')
  })

export default async function DebugServerSentry() {
  const val = await mockError()
  return <div>This will never render</div>
}
