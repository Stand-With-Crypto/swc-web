import { REPLACE_ME__captureException } from '@/utils/shared/captureException'

export class FetchReqError extends Error {
  response: Response

  constructor(response: Response) {
    super(response.statusText)
    this.response = response
  }
}

export const checkFetchStatus = (response: Response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  throw new FetchReqError(response)
}

export const fetchReq = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options)
  if (response.status >= 200 && response.status < 300) {
    return response
  }
  const error = new FetchReqError(response)
  REPLACE_ME__captureException(error)
  throw error
}
