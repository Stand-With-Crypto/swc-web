'use client'
import * as React from 'react'

import { useIsMobile } from '@/hooks/useIsMobile'

// This constant is the difference between the scrollY position saved and the actual height of the page
// If we use just the scrollY position saved, the page will actually scroll more than it should.
const DIFF_SCROLL_Y_TO_ACTUAL_HEIGHT = 148

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

  window.scrollTo(0, Number(scrollHeight) - DIFF_SCROLL_Y_TO_ACTUAL_HEIGHT)
  sessionStorage.removeItem('scrollHeight')
  return
}

// This hook "fixes" a known issue on iOS devices where when you open a modal with the keyboard
// opened, the keyboard will push the entire page up.

// This happens because if the keyboard is already open the component will no resize to fit the
// screen height when using 100dvh but instead it behaves like 100vh, causing the keyboard to
//  offset the page to the top.

// To fix this, this hook will save the current scrollY position when it is rendered and scroll
// the entire page to the top. Once the hook is unmounted, it will scroll the page back to the
// original position.

// References:
// https://stackoverflow.com/questions/13820088/how-to-prevent-keyboard-push-up-webview-at-ios-app-using-phonegap
// https://stackoverflow.com/questions/38619762/how-to-prevent-ios-keyboard-from-pushing-the-view-off-screen-with-css-or-js
export function usePreventMobileKeyboardOffset() {
  const isMobile = useIsMobile()

  React.useEffect(() => {
    if (isMobile) setScrollHeight()

    return () => {
      resetScrollPosition()
    }
  }, [isMobile])
}
