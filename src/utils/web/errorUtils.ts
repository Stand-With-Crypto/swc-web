export const GENERIC_ERROR_TITLE = 'Uh oh! Something went wrong.'
export const GENERIC_ERROR_DESCRIPTION =
  "There was a problem with your request. We're investigating it now."

export const formatErrorStatus = (status: number) => {
  switch (status) {
    case 401:
      return 'Please login first'
    default:
      return GENERIC_ERROR_DESCRIPTION
  }
}
