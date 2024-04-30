import { useEffect } from 'react'

export function usePreventOverscroll() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'scroll'
    }
  }, [])
}
