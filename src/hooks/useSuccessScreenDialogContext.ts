import { createContext, useContext } from 'react'

export const SWCSuccessDialogContext = createContext<{
  closeSuccessScreenDialogAfterNavigating: () => void
}>({
  closeSuccessScreenDialogAfterNavigating: () => {},
})

export function useSuccessScreenDialogContext() {
  return useContext(SWCSuccessDialogContext)
}
