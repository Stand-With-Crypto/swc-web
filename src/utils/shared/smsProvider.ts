import { requiredEnv } from '@/utils/shared/requiredEnv'

const SMS_PROVIDER = requiredEnv(process.env.SMS_PROVIDER, 'SMS_PROVIDER')

if (SMS_PROVIDER !== 'capitol-canary' && SMS_PROVIDER !== 'twilio') {
  throw new Error('Invalid SMS provider')
}

export const smsProvider = SMS_PROVIDER
