export interface SendgridContactsError {
  message: string
  code: number
  response: {
    body: {
      errors: {
        field: string
        message: string
      }[]
    }
  }
}

export function isSendgridError(error: unknown): error is SendgridContactsError {
  if (typeof error !== 'object' || error === null) {
    return false
  }
  const err = error as Record<string, any>

  return (
    typeof err.message === 'string' &&
    typeof err.code === 'number' &&
    typeof err.response === 'object' &&
    err.response !== null &&
    typeof err.response.body === 'object' &&
    err.response.body !== null &&
    Array.isArray(err.response.body.errors)
  )
}
