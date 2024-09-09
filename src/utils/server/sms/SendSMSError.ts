import axios from 'axios'
import RestException from 'twilio/lib/base/RestException'

export const INVALID_PHONE_NUMBER_CODE = 21211
export const NOT_A_VALID_PHONE_NUMBER_CODE = 21614
export const TOO_MANY_REQUESTS_CODE = 20429
export const IS_UNSUBSCRIBED_USER_CODE = 21610
export const MESSAGE_BLOCKED_CODE = 30004

export class SendSMSError {
  phoneNumber: string
  code: number | string = 'Unknown'
  message = 'Unknown SendSMS Error'
  moreInfo?: string
  details?: object | unknown

  isInvalidPhoneNumber: boolean = false
  isTooManyRequests: boolean = false
  isUnsubscribedUser: boolean = false

  constructor(error: unknown, phoneNumber: string) {
    this.phoneNumber = phoneNumber

    if (error instanceof RestException) {
      if (error.code) {
        this.code = error.code
      }
      this.message = error.message
      this.moreInfo = error.moreInfo
      this.details = error.details
    } else if (axios.isAxiosError(error)) {
      if (error.code) {
        this.code = error.code
      }
      this.message = error.message
      this.moreInfo = error.stack
      this.details = error.cause
    } else {
      if ('code' in (error as any)) {
        this.code = (error as any).code
      }
      if ('message' in (error as any)) {
        this.message = (error as any).message
      }
    }

    this.isInvalidPhoneNumber =
      this.code === INVALID_PHONE_NUMBER_CODE || this.code === NOT_A_VALID_PHONE_NUMBER_CODE
    this.isUnsubscribedUser = this.code === IS_UNSUBSCRIBED_USER_CODE
    this.isTooManyRequests =
      this.code === TOO_MANY_REQUESTS_CODE ||
      this.code === 'ECONNABORTED' ||
      this.code === 'ETIMEDOUT'
  }
}
