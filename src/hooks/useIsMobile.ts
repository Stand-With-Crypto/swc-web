import { useMedia } from 'react-use'

export const useIsMobile = ({ defaultState }: { defaultState: boolean }) =>
  useMedia('(max-width: 767px)', defaultState)
