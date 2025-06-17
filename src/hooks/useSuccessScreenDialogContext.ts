import { createContext, useContext } from 'react'

export const SWCSuccessDialogContext = createContext<{
  shouldCloseSuccessScreenDialog: () => void
}>({
  shouldCloseSuccessScreenDialog: () => {},
})

export function useSuccessScreenDialogContext() {
  return useContext(SWCSuccessDialogContext)
}
