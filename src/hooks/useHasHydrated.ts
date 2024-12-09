import React from 'react'

// fix for https://nextjs.org/docs/messages/react-hydration-error
export const useHasHydrated = () => {
  const hasMounted = React.useRef(false)
  React.useEffect(() => {
    hasMounted.current = true
  }, [])
  return hasMounted
}
