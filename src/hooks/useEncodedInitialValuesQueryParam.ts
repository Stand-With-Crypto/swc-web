import { useMemo } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useSearchParams } from 'next/navigation'

type Field = 'address' | 'email' | 'fullName' | 'zipCode' | 'firstName' | 'lastName'
type RnParams = Partial<Record<Field, string>>

/**
 * RN app encodes the rn query param using btoa.
 *
 * This hook decodes the rn query param and returns the decoded values.
 *
 * Components using this hook must be wrapped in a Suspense boundary since it uses `useSearchParams`
 */
export function useEncodedInitialValuesQueryParam<T extends RnParams>(initialValues: Required<T>) {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const encodedRn = searchParams?.get('rn')
    if (encodedRn) {
      try {
        const decoded = atob(encodedRn)
        const userData = JSON.parse(decoded) as T

        const keys = Object.keys(initialValues)
        keys.forEach(key => {
          if (userData[key as Field]) {
            initialValues[key as Field] = userData[key as Field]
          }
        })

        // RN does not pass in firstName and lastName, so derive from full name
        if (userData.fullName) {
          const splitFullName = userData.fullName.split(' ')

          if (keys.includes('firstName')) {
            initialValues.firstName = splitFullName[0]
          }
          if (keys.includes('lastName')) {
            initialValues.lastName = splitFullName.splice(1).join(' ')
          }
        }

        return initialValues
      } catch (e) {
        if (e instanceof Error) {
          Sentry.captureException(e, {
            tags: {
              domain: 'useEncodedInitialValuesQueryParam',
            },
            extra: { encodedRn },
          })
        }
        return undefined
      }
    }

    return undefined
  }, [initialValues, searchParams])
}
