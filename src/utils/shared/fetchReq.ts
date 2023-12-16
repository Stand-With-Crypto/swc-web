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
  checkFetchStatus(response)
  return response
}
