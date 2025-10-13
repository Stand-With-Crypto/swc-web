import { fetchReq } from '@/utils/shared/fetchReq'
import { requiredOutsideLocalEnv } from '@/utils/shared/requiredEnv'
import { NEXT_PUBLIC_ENVIRONMENT } from '@/utils/shared/sharedEnv'

const INNGEST_SIGNING_KEY = requiredOutsideLocalEnv(
  process.env.INNGEST_SIGNING_KEY,
  'INNGEST_SIGNING_KEY',
  'Programmatically cancel Inngest job',
)!

function getInngestApiUrl() {
  switch (NEXT_PUBLIC_ENVIRONMENT) {
    case 'production':
    case 'preview':
      return 'https://api.inngest.com'
    default:
      return 'http://localhost:8288'
  }
}

const INNGEST_API_URL = getInngestApiUrl()

export async function cancelInngestRun(runId: string) {
  await fetchReq(
    `${INNGEST_API_URL}/v1/runs/${runId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INNGEST_SIGNING_KEY}`,
      },
    },
    {
      withScope: scope => {
        scope.setTag('domain', 'cancelInngestRun')
        scope.setContext('inngest', { runId })
      },
    },
  )
}
