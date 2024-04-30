import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function usePreventOverscroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.includes('/action/')) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'scroll'
    }
  }, [pathname])
}
