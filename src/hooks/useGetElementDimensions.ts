import React from 'react'

export function useGetElementDimensions(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect()
      setSize({ width, height })
    }
  }, [ref])

  return size
}
