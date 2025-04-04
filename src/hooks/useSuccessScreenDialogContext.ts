import { createContext, useContext } from 'react'

export const SWCSuccessDialogContext = createContext<{
  onCtaClick: () => void
}>({
  onCtaClick: () => {},
})

export function useSuccessScreenDialogContext() {
  return useContext(SWCSuccessDialogContext)
}
