import { useEffect } from 'react'

export function usePreventIOSOverscroll() {
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = 'scroll'
    }
  }, [])
}
