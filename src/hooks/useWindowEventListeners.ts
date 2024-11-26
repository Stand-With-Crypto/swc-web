'use client'

import { useEffect } from 'react'

type EventListeners = keyof WindowEventMap

type CallbackFunction<T extends EventListeners> = (event: WindowEventMap[T]) => void

const handleAddEventListeners = <T extends EventListeners>(
  eventListeners: T[],
  callbackFunction: CallbackFunction<T>,
) => {
  if (typeof window === 'undefined') return

  eventListeners.forEach(eventName => {
    window.addEventListener(eventName, callbackFunction)
  })
}

const handleRemoveEventListeners = <T extends EventListeners>(
  eventListeners: T[],
  callbackFunction: CallbackFunction<T>,
) => {
  if (typeof window === 'undefined') return

  eventListeners.forEach(eventName => {
    window.removeEventListener(eventName, callbackFunction)
  })
}

export function useWindowEventListeners<T extends EventListeners>(
  eventListeners: T | T[],
  callbackFunction: CallbackFunction<T>,
) {
  useEffect(() => {
    const events = Array.isArray(eventListeners) ? eventListeners : [eventListeners]

    handleAddEventListeners(events, callbackFunction)

    return () => {
      handleRemoveEventListeners(events, callbackFunction)
    }
  }, [callbackFunction, eventListeners])

  return null
}
