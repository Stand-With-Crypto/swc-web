import { useMedia } from 'react-use'

export const useIsMobile = ({ defaultState = false }: { defaultState?: boolean } = {}) =>
  useMedia('(max-width: 767px)', defaultState)
