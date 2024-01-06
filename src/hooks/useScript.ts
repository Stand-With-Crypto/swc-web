import React from 'react'
import * as Sentry from '@sentry/nextjs'

type Status = 'loading' | 'error' | 'ready' | 'unknown'
// https://github.com/uidotdev/usehooks/blob/main/index.js
export function useScript(src: string, options: { removeOnUnmount?: boolean } = {}) {
  const [status, setStatus] = React.useState<Status>('loading')
  const optionsRef = React.useRef(options)

  React.useEffect(() => {
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`)

    const domStatus = script?.getAttribute('data-status') as Status | null | undefined
    if (domStatus) {
      setStatus(domStatus)
      return
    }

    if (script === null) {
      script = document.createElement('script')
      script.src = src
      script.async = true
      script.setAttribute('data-status', 'loading')
      document.body.appendChild(script)

      const handleScriptLoad = () => {
        script!.setAttribute('data-status', 'ready')
        setStatus('ready')
        removeEventListeners()
      }

      const handleScriptError = () => {
        script!.setAttribute('data-status', 'error')
        setStatus('error')
        removeEventListeners()
      }

      const removeEventListeners = () => {
        script!.removeEventListener('load', handleScriptLoad)
        script!.removeEventListener('error', handleScriptError)
      }

      script.addEventListener('load', handleScriptLoad)
      script.addEventListener('error', handleScriptError)

      const removeOnUnmount = optionsRef.current.removeOnUnmount

      return () => {
        if (removeOnUnmount === true) {
          script!.remove()
          removeEventListeners()
        }
      }
    } else {
      setStatus('unknown')
      Sentry.captureMessage('Unexpected useScript state', { extra: { src, domStatus, options } })
    }
  }, [src])

  return status
}
