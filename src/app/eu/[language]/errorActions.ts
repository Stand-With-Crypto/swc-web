'use server'

import { FetchReqError } from '@/utils/shared/fetchReq'

export async function triggerGenericError() {
  throw new Error('This is a test generic error to demonstrate translated error messages')
}

export async function trigger401Error() {
  // Simulate a 401 FetchReqError
  const mockResponse = new Response('Unauthorized', {
    status: 401,
    statusText: 'Unauthorized',
  })

  throw new FetchReqError(mockResponse, 'Unauthorized')
}

export async function trigger500Error() {
  // Simulate a 500 FetchReqError
  const mockResponse = new Response('Internal Server Error', {
    status: 500,
    statusText: 'Internal Server Error',
  })

  throw new FetchReqError(mockResponse, 'Internal Server Error')
}
