import React from 'react'

export function useLoadingCallback<T extends (...args: unknown[]) => unknown | Promise<unknown>>(
  callback: T,
  deps: React.DependencyList,
): [T, boolean] {
  const [loading, setLoading] = React.useState(false)

  const callbackMemoized = React.useCallback(
    (...args: Parameters<T>) => {
      console.log({ started: 'callback' })
      setLoading(true)
      try {
        return callback(...args)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, setLoading],
  )

  return React.useMemo(() => [callbackMemoized as T, loading], [callbackMemoized, loading])
}
