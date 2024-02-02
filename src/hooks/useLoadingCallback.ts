import React from 'react'

// `(...args: any)` is necessary for type inference to work properly
// The type of T will be inferred by `callback` on usage though
export function useLoadingCallback<T extends (...args: any) => Promise<unknown>>(
  callback: T,
  deps: React.DependencyList = [],
): [T, boolean] {
  const [loading, setLoading] = React.useState(false)

  const callbackMemoized = React.useCallback(
    async (...args: Parameters<T>) => {
      setLoading(true)
      try {
        return await callback(...args)
      } finally {
        setLoading(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps, setLoading],
  )

  return React.useMemo(() => [callbackMemoized as T, loading], [callbackMemoized, loading])
}
