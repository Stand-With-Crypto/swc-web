import { requiredEnv } from '@/utils/shared/requiredEnv'

const SMS_PROVIDER = requiredEnv(process.env.SMS_PROVIDER, 'SMS_PROVIDER')

export enum SMSProviders {
  TWILIO = 'twilio',
  CAPITOL_CANARY = 'capitol-canary',
}

if (!Object.values(SMSProviders).includes(SMS_PROVIDER)) {
  throw new Error('Invalid SMS provider')
}

export const smsProvider = SMS_PROVIDER
