import { REPLACE_ME__captureException } from '@/utils/shared/captureException'
import { USER_SESSION_ID_COOKIE_NAME } from '@/utils/shared/userSessionId'
import { NextApiRequest } from 'next'

export function getUserSessionIdOnPageRouter(req: NextApiRequest) {
  const value = req.cookies[USER_SESSION_ID_COOKIE_NAME]
  if (!value) {
    // this should be getting set in middleware so we want to trigger some analytics errors if its not set
    REPLACE_ME__captureException(new Error(`getUserSessionIdOnPageRouter: cookie not set`))
  }
  return value!
}
