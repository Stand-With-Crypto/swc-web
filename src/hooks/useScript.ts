import { useEffect, useState } from 'react'

type UseScriptStatus = 'idle' | 'loading' | 'ready' | 'error'

interface UseScriptOptions {
  shouldPreventLoad?: boolean
  removeOnUnmount?: boolean
  id?: string
}

const cachedScriptStatuses = new Map<string, UseScriptStatus | undefined>()

function getScriptNode(src: string) {
  const node: HTMLScriptElement | null = document.querySelector(`script[src="${src}"]`)
  const status = node?.getAttribute('data-status') as UseScriptStatus | undefined

  return {
    node,
    status,
  }
}

/**
 * https://usehooks-ts.com/react-hook/use-script#hook
 */
export function useScript(src: string | null, options?: UseScriptOptions): UseScriptStatus {
  const [status, setStatus] = useState<UseScriptStatus>(() => {
    if (!src || options?.shouldPreventLoad) {
      return 'idle'
    }

    if (typeof window === 'undefined') {
      return 'loading'
    }

    return cachedScriptStatuses.get(src) ?? 'loading'
  })

  useEffect(() => {
    if (!src || options?.shouldPreventLoad) {
      return
    }

    const cachedScriptStatus = cachedScriptStatuses.get(src)
    if (cachedScriptStatus === 'ready' || cachedScriptStatus === 'error') {
      setStatus(cachedScriptStatus)
      return
    }

    const script = getScriptNode(src)
    let scriptNode = script.node

    if (!scriptNode) {
      scriptNode = document.createElement('script')
      scriptNode.src = src
      scriptNode.async = true
      if (options?.id) {
        scriptNode.id = options.id
      }
      scriptNode.setAttribute('data-status', 'loading')
      document.body.appendChild(scriptNode)

      const setAttributeFromEvent = (event: Event) => {
        const scriptStatus: UseScriptStatus = event.type === 'load' ? 'ready' : 'error'

        scriptNode?.setAttribute('data-status', scriptStatus)
      }

      scriptNode.addEventListener('load', setAttributeFromEvent)
      scriptNode.addEventListener('error', setAttributeFromEvent)
    } else {
      setStatus(script.status ?? cachedScriptStatus ?? 'loading')
    }

    const setStateFromEvent = (event: Event) => {
      const newStatus = event.type === 'load' ? 'ready' : 'error'
      setStatus(newStatus)
      cachedScriptStatuses.set(src, newStatus)
    }

    scriptNode.addEventListener('load', setStateFromEvent)
    scriptNode.addEventListener('error', setStateFromEvent)

    return () => {
      if (scriptNode) {
        scriptNode.removeEventListener('load', setStateFromEvent)
        scriptNode.removeEventListener('error', setStateFromEvent)
      }

      if (scriptNode && options?.removeOnUnmount) {
        scriptNode.remove()
        cachedScriptStatuses.delete(src)
      }
    }
  }, [src, options?.shouldPreventLoad, options?.removeOnUnmount, options?.id])

  return status
}
