import { useEffect, useState } from 'react'

export function useUrlHash() {
  const [urlHash, setUrlHash] = useState<string | null>()

  useEffect(() => {
    const hash =
      typeof window !== 'undefined'
        ? decodeURIComponent(window.location.hash.replace('#', ''))
        : null

    setUrlHash(hash)
  }, [])

  return { urlHash }
}
