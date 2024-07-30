import axios from 'axios'
import RestException from 'twilio/lib/base/RestException'

export const INVALID_PHONE_NUMBER_CODE = 212111
export const TOO_MANY_REQUESTS_CODE = 20429

export class SendSMSError {
  phoneNumber: string
  code?: number | string
  message?: string
  moreInfo?: string
  details?: object | unknown

  isInvalidPhoneNumber: boolean = false
  isTooManyRequests: boolean = false

  constructor(error: unknown, phoneNumber: string) {
    this.phoneNumber = phoneNumber

    if (error instanceof RestException) {
      this.code = error.code
      this.message = error.message
      this.moreInfo = error.moreInfo
      this.details = error.details
    } else if (axios.isAxiosError(error)) {
      this.code = error.code
      this.message = error.message
      this.moreInfo = error.stack
      this.details = error.cause
    } else if ('code' in (error as any)) {
      this.code = (error as any).code
    }

    this.isInvalidPhoneNumber = this.code === INVALID_PHONE_NUMBER_CODE
    this.isTooManyRequests = this.code === TOO_MANY_REQUESTS_CODE || this.code === 'ECONNABORTED'
  }
}