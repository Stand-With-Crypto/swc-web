import { useMedia } from 'react-use'

export const useIsMobile = () => useMedia('(max-width: 767px)')
