import { useEffect, useState, useRef } from 'react'
import { sleep } from '@/utils/shared/sleep'
import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'

export function useThrottledActionUpdates(actions: RecentActivityRowProps['action'][]) {
  const [throttledActions, setThrottledActions] = useState(actions)
  const isMounted = useRef(true)

  useEffect(() => {
    async function throttleUpdates() {
      if (!isMounted) {
        return
      }

      const newActions = actions.filter(action => !throttledActions.some(a => a.id === action.id))

      for (const action of newActions) {
        const delayMs = Math.floor(Math.random() * (2000 - 750)) + 750
        await sleep(delayMs)
        setThrottledActions(prevActions => [action, ...prevActions].slice(0, prevActions.length))
      }
    }

    throttleUpdates()

    return () => {
      isMounted.current = false
    }
  }, [actions])

  return throttledActions
}
