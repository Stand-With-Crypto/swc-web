import { testCNNEmailSend } from '@/inngest/functions/testCNNEmail/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

const TEST_CNN_EMAIL_INNGEST_EVENT_NAME = 'script/cleanup-postal-codes'
const TEST_CNN_EMAIL_INNGEST_FUNCTION_ID = 'script.cleanup-postal-codes'
export const testCNNEmail = inngest.createFunction(
  {
    id: TEST_CNN_EMAIL_INNGEST_FUNCTION_ID,
    retries: 0,
    onFailure: onScriptFailure,
  },
  { event: TEST_CNN_EMAIL_INNGEST_EVENT_NAME },
  async ({ step }) => {
    return await step.run('execute-script', async () => {
      return await testCNNEmailSend()
    })
  },
)
