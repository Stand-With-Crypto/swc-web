import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'

type RnParams = {
  address?: string
  email?: string
  fullName?: string
  zipCode?: string
}

// decode query param with key rn
// atob used on client
// so on react native, we need to do btoa
export function useParseRnQueryParam() {
  const searchParams = useSearchParams()
  const [address, setAddress] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [zipCode, setZipCode] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const encodedRn = searchParams?.get('rn')
    setLoading(true)

    if (encodedRn) {
      try {
        const decoded = atob(encodedRn)
        const userData = JSON.parse(decoded) as RnParams

        if (userData?.address) {
          setAddress(userData.address)
        }
        if (userData?.email) {
          setEmail(userData.email)
        }
        if (userData?.zipCode) {
          setZipCode(userData.zipCode)
        }
        if (userData?.fullName) {
          setFullName(userData.fullName)
        }
      } catch (e) {
        if (e instanceof Error) {
          Sentry.captureException(e, {
            tags: {
              domain: 'useParseRnQueryParam',
            },
            extra: { encodedRn },
          })
        }
      }
    }
    setLoading(false)
  }, [searchParams])

  return useMemo(
    () => ({ address, email, fullName, zipCode, loading }),
    [address, email, fullName, loading, zipCode],
  )
}
