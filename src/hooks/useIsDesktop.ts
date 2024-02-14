import { useMedia } from 'react-use'

export const useIsDesktop = ({ defaultState = false }: { defaultState?: boolean } = {}) =>
  useMedia('(min-width: 1024px)', defaultState)
