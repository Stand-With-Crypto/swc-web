import { testCNNEmailSend } from '@/inngest/functions/testCNNEmail/logic'
import { inngest } from '@/inngest/inngest'
import { onScriptFailure } from '@/inngest/onScriptFailure'

const TEST_CNN_EMAIL_INNGEST_EVENT_NAME = 'script/test-cnn-email'
const TEST_CNN_EMAIL_INNGEST_FUNCTION_ID = 'script.test-cnn-email'
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
