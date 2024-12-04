import React from 'react'

export function useResizeObserver(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (!ref.current) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].target.getBoundingClientRect()
      setSize({ width, height })
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  return size
}
