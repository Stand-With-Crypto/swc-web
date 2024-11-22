'use client'

import { useEffect } from 'react'

export function ScrollToTopOnRender() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return null
}
