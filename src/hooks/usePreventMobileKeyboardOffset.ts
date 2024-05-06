'use client'
import * as React from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'

const OFFSET_SCROLLY_TO_ACTUAL_HEIGHT = 148

function getScrollHeight() {
  if (typeof sessionStorage === 'undefined') return null
  return sessionStorage.getItem('scrollHeight')
}

function setScrollHeight() {
  sessionStorage.setItem('scrollHeight', String(window.scrollY))
  window.scrollTo(0, 0)
  return
}

function resetScrollPosition() {
  const scrollHeight = getScrollHeight()
  if (!scrollHeight) return

  window.scrollTo(0, Number(scrollHeight) - OFFSET_SCROLLY_TO_ACTUAL_HEIGHT)
  sessionStorage.removeItem('scrollHeight')
  return
}

export function usePreventMobileKeyboardOffset() {
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (isMobile) setScrollHeight()

    return () => {
      resetScrollPosition()
    }
  }, [isMobile])
}
