import { useEffect, useRef, useState } from 'react'

import { RecentActivityRowProps } from '@/components/app/recentActivityRow/recentActivityRow'

function getRandomDelay(min = 750, max = 1550) {
  return Math.random() * (max - min) + min
}

export function useThrottledActionUpdates(
  actions: RecentActivityRowProps['action'][],
  maxListSize = 10,
) {
  const [visibleActions, setVisibleActions] = useState(actions.slice(0, maxListSize))

  useEffect(() => {
    let isCancelled = false

    const processAction = (actionQueue: RecentActivityRowProps['action'][]) => {
      if (isCancelled || actionQueue.length === 0) return

      setVisibleActions(prevVisibleActions => {
        const nextAction = actionQueue.shift()
        return nextAction
          ? [nextAction, ...prevVisibleActions].slice(0, maxListSize)
          : prevVisibleActions
      })

      setTimeout(() => processAction(actionQueue), getRandomDelay())
    }

    const newActions = actions.filter(
      action => !visibleActions.some(visibleAction => visibleAction.id === action.id),
    )

    processAction([...newActions])

    return () => {
      isCancelled = true
    }
  }, [actions, maxListSize])

  return visibleActions
}
