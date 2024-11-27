import { useEffect } from 'react'

export function useSyncScroll(refs: React.RefObject<HTMLDivElement>[]) {
  useEffect(() => {
    if (refs.length < 2) return

    const handleScroll = (sourceRef: React.RefObject<HTMLDivElement>) => {
      if (!sourceRef.current) return

      const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } =
        sourceRef.current

      refs.forEach(ref => {
        if (ref.current && ref !== sourceRef) {
          const target = ref.current

          // Calculate proportional scroll positions
          const proportionalScrollTop =
            (scrollTop / (scrollHeight - clientHeight)) *
            (target.scrollHeight - target.clientHeight)
          const proportionalScrollLeft =
            (scrollLeft / (scrollWidth - clientWidth)) * (target.scrollWidth - target.clientWidth)

          target.scrollTop = proportionalScrollTop || 0
          target.scrollLeft = proportionalScrollLeft || 0
        }
      })
    }

    const eventListeners = refs.map(ref => {
      const scrollHandler = () => handleScroll(ref)
      ref.current?.addEventListener('scroll', scrollHandler)
      return { ref, scrollHandler }
    })

    // Cleanup event listeners
    return () => {
      eventListeners.forEach(({ ref, scrollHandler }) => {
        ref.current?.removeEventListener('scroll', scrollHandler)
      })
    }
  }, [refs])
}
