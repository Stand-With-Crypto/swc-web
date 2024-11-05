'use client'

import { useCallback, useState } from 'react'
import Cookies from 'js-cookie'

export function useCookieState(
  cookieName: string,
): [string | undefined, (newValue: string, options?: Cookies.CookieAttributes) => void] {
  const [value, setStateValue] = useState(() => Cookies.get(cookieName))

  const setValue = useCallback(
    (newValue: string, options?: Cookies.CookieAttributes) => {
      Cookies.set(cookieName, newValue, options)
      setStateValue(newValue)
    },
    [cookieName],
  )

  return [value, setValue]
}
