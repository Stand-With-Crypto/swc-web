import axios from 'axios'
import RestException from 'twilio/lib/base/RestException'

import * as smsErrorCodes from './errorCodes'

export class SendSMSError {
  phoneNumber: string
  code = 'Unknown'
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
        this.code = String(error.code)
      }
      this.message = error.message
      this.moreInfo = error.moreInfo
      this.details = error.details
    } else if (axios.isAxiosError(error)) {
      if (error.code) {
        this.code = String(error.code)
      }
      this.message = error.message
      this.moreInfo = error.stack
      this.details = error.cause
    } else {
      if ('code' in (error as any)) {
        this.code = String((error as any).code)
      }
      if ('message' in (error as any)) {
        this.message = (error as any).message
      }
    }

    this.isInvalidPhoneNumber =
      this.code === smsErrorCodes.INVALID_PHONE_NUMBER_CODE ||
      this.code === smsErrorCodes.NOT_A_VALID_PHONE_NUMBER_CODE ||
      this.code === smsErrorCodes.INFORMATION_SERVICE_NUMBER_CODE
    this.isUnsubscribedUser = this.code === smsErrorCodes.IS_UNSUBSCRIBED_USER_CODE
    this.isTooManyRequests =
      this.code === smsErrorCodes.TOO_MANY_REQUESTS_CODE ||
      this.code === 'ECONNABORTED' ||
      this.code === 'ETIMEDOUT'
  }
}
