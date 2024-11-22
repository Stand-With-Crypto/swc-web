'use client'

import { useEffectOnce } from '@/hooks/useEffectOnce'
import { useUrlHash } from '@/hooks/useUrlHash'

interface ScrollToTopOnRenderProps {
  blockedHashes?: string[]
}

/**
 * This component scrolls the page to the top when rendered.
 * You can prevent this behavior by providing a list of URL hashes that should bypass the scroll-to-top action.
 * It's particularly useful in server-rendered pages where you want to ensure the user starts at the top of the page upon rendering.
 *
 *
 * @param blockedHashes - optional - A list of hashes that should not trigger the scroll to top
 * @example <ScrollToTopOnRender blockedHashes={["questionnaire"]} />
 * @returns null
 */
export function ScrollToTopOnRender({ blockedHashes }: ScrollToTopOnRenderProps) {
  const urlHash = useUrlHash()

  useEffectOnce(() => {
    const shouldNotScrollToTop = blockedHashes && blockedHashes.some(hash => urlHash === hash)
    if (shouldNotScrollToTop) return

    window.scrollTo(0, 0)
  })

  return null
}
