'use client'

import Cookie from 'js-cookie'
import useSWR, { mutate } from 'swr'

const COOKIE_KEY = 'SWC_LOCAL_HAS_SEEN_COMPLETE_PROFILE_PROMPT'

export function setHasSeenCompleteProfilePrompt(value: boolean) {
  Cookie.set(COOKIE_KEY, String(value))
  mutate(COOKIE_KEY, value)
}

export function useHasSeenCompleteProfilePrompt() {
  return useSWR(COOKIE_KEY, () => {
    return Cookie.get(COOKIE_KEY) === 'true'
  })
}
