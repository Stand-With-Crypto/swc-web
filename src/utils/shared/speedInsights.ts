import { requiredEnv } from './requiredEnv'

const INITIAL_SAMPLE_RATE = Number(
  requiredEnv(
    process.env.NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE,
    'NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE',
  ),
)

if (isNaN(INITIAL_SAMPLE_RATE)) {
  throw new Error('NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE is not a number')
}

export const NEXT_PUBLIC_SPEED_INSIGHTS_SAMPLE_RATE = INITIAL_SAMPLE_RATE
