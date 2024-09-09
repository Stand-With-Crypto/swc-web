import { inngest } from '@/inngest/inngest'

const TIME_TEST_INNGEST_FUNCTION_ID = 'test.time'
const TIME_TEST_INNGEST_EVENT_NAME = 'test.time'

export const timeTest = inngest.createFunction(
  {
    id: TIME_TEST_INNGEST_FUNCTION_ID,
    retries: 0,
  },
  { event: TIME_TEST_INNGEST_EVENT_NAME },
  async ({ step, logger }) => {
    const stepDate = await step.run('get-date', () => new Date())
    const now = new Date()

    logger.info({
      stepDate,
      now,
    })

    for (let i = 0; i < 5; i++) {
      const currentDate = new Date()
      const currentStepDate = await step.run('get-current-date', () => new Date())

      logger.info({
        currentDate,
        currentStepDate,
      })

      await step.sleep('sleep-test', '10s')
    }

    return {
      stepDate,
      now,
    }
  },
)
