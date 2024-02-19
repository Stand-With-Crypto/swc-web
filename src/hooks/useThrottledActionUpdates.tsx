import { useEffect, useState, useRef } from 'react'
import { sleep } from '@/utils/shared/sleep'
import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'

export function useThrottledActionUpdates(actions: RecentActivityRowProps['action'][]) {
  const [throttledActions, setThrottledActions] = useState(actions)

  // Adding throttledActions as a useEffect dependency can lead to an infinite loop,
  // so we use a ref to get the current value without causing re-renders.
  const throttledActionsRef = useRef(throttledActions)
  useEffect(() => {
    throttledActionsRef.current = throttledActions
  }, [throttledActions])

  useEffect(() => {
    async function throttleUpdates() {
      const newActions = actions.filter(
        action => !throttledActionsRef.current.some(a => a.id === action.id),
      )

      for (const action of newActions) {
        const delayMs = Math.floor(Math.random() * (2000 - 750)) + 750
        await sleep(delayMs)
        setThrottledActions(prevActions => [action, ...prevActions].slice(0, prevActions.length))
      }
    }

    throttleUpdates()
  }, [actions])

  return throttledActions
}
