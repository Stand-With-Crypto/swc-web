import { Children, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { animate, domAnimation, LazyMotion, m, useMotionValue } from 'motion/react'

import { cn } from '@/utils/web/cn'

const AUTOPLAY_DELAY = 5000

export function EventPhotosSlideshow({ children }: { children: ReactNode | ReactNode[] }) {
  const [index, setIndex] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  const childrens = Children.toArray(children)

  const calculateNewX = useCallback(
    () => -index * (containerRef.current?.clientWidth || 0),
    [index],
  )

  const handleNext = useCallback(() => {
    setIndex(index + 1 === childrens.length ? 0 : index + 1)
  }, [index, childrens.length])

  const handlePrev = () => {
    setIndex(index - 1 < 0 ? childrens.length - 1 : index - 1)
  }

  useEffect(() => {
    const handleAnimation = async () => {
      await animate(x, calculateNewX(), {
        type: 'tween',
        duration: 0.5,
      })
    }

    window.addEventListener('resize', () => handleAnimation())

    return () => window.removeEventListener('resize', () => handleAnimation())
  }, [calculateNewX, x])

  useEffect(() => {
    const controls = animate(x, calculateNewX(), {
      type: 'tween',
      duration: 0.5,
    })

    return controls.stop
  }, [calculateNewX, index, x])

  useEffect(() => {
    const timer = setInterval(() => handleNext(), AUTOPLAY_DELAY)

    return () => clearInterval(timer)
  }, [handleNext])

  if (childrens.length === 0) return null

  return (
    <div
      className="relative flex h-full w-full overflow-x-hidden rounded-3xl lg:h-[420px] lg:w-[466px]"
      ref={containerRef}
    >
      {childrens.map((child, i) => (
        <LazyMotion features={domAnimation} key={i}>
          <m.div
            className="inline-block h-full w-full flex-none"
            style={{
              x,
              left: `${i * 100}%`,
              right: `${i * 100}%`,
            }}
          >
            {child}
          </m.div>
        </LazyMotion>
      ))}

      <button
        className="!absolute left-4 top-2/4 grid h-12 max-h-[48px] w-12 max-w-[48px] -translate-y-2/4 select-none place-items-center rounded-full text-white transition-all hover:bg-white/10 active:bg-white/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        onClick={handlePrev}
      >
        <svg
          className="-ml-1 h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15.75 19.5L8.25 12l7.5-7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <button
        className="!absolute right-4 top-2/4 grid h-12 max-h-[48px] w-12 max-w-[48px] -translate-y-2/4 select-none place-items-center rounded-full text-white transition-all hover:bg-white/10 active:bg-white/30 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
        onClick={handleNext}
      >
        <svg
          className="ml-1 h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8.25 4.5l7.5 7.5-7.5 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {childrens.length < 15 && (
        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
          {new Array(childrens.length).fill('').map((_, i) => (
            <span
              className={cn(
                "block h-3 w-3 cursor-pointer rounded-full transition-colors content-['']",
                index === i && 'bg-white',
                index !== i && 'bg-white/50',
              )}
              key={i}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
