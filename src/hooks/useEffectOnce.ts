import { EffectCallback, useEffect, useRef } from 'react'

/**
 * This exists because the `useEffectOnce` from `react-use` doesn't cover the case where
 * react strict makes so the component runs the effect twice on local. This way we ensure
 * the effect runs only once both in local and prod.
 */
export function useEffectOnce(effect: EffectCallback) {
  const hasRun = useRef(false)
  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true
      effect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
