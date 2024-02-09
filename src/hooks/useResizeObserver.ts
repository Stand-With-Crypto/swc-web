import React from 'react'

export function useResizeObserver(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = React.useState({ height: 0, width: 0 })

  React.useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].target.getBoundingClientRect()
      setSize({ height, width })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return size
}
