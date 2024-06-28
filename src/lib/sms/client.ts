import twilio from 'twilio'

import { requiredEnv } from '@/utils/shared/requiredEnv'

const TWILIO_ACCOUNT_SID = requiredEnv(process.env.TWILIO_ACCOUNT_SID, 'TWILIO_ACCOUNT_SID')
const TWILIO_AUTH_TOKEN = requiredEnv(process.env.TWILIO_AUTH_TOKEN, 'TWILIO_AUTH_TOKEN')

export const messagingClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
