import cookie from 'js-cookie'

export const USER_ID_COOKIE_NAME = 'SWC_USER_ID'

export const getUserIdOnClient = () => {
  return cookie.get(USER_ID_COOKIE_NAME)
}
