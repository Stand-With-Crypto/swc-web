import React from 'react'

// fix for https://nextjs.org/docs/messages/react-hydration-error
export const useHasHydrated = () => {
  const [hasMounted, setHasMounted] = React.useState(false)
  React.useEffect(() => {
    setHasMounted(true)
  }, [])
  return hasMounted
}
