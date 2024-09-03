'use client'

import { useCallback, useState } from 'react'
import Cookies from 'js-cookie'

export function useCookieState(
  cookieName: string,
): [string | undefined, (newValue: string) => void] {
  const [value, setStateValue] = useState(() => Cookies.get(cookieName))

  const setValue = useCallback(
    (newValue: string) => {
      Cookies.set(cookieName, newValue)
      setStateValue(newValue)
    },
    [cookieName],
  )

  return [value, setValue]
}
