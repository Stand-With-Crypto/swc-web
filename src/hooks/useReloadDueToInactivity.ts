import { useCallback, useEffect, useRef } from 'react'

export function useReloadDueToInactivity({ timeInMinutes }: { timeInMinutes: number }) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const reloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(reloadPage, timeInMinutes * 60 * 1000)
  }, [timeInMinutes])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']

    events.forEach(event => window.addEventListener(event, resetTimer))

    resetTimer()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      events.forEach(event => window.removeEventListener(event, resetTimer))
    }
  }, [resetTimer, timeInMinutes])

  return null
}
