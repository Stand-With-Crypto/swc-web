import { useMemo } from 'react'
import * as Sentry from '@sentry/nextjs'
import { useSearchParams } from 'next/navigation'

import { usePlacesAutocompleteAddress } from '@/hooks/usePlacesAutocompleteAddress'

type Field = 'address' | 'email' | 'fullName' | 'zipCode' | 'firstName' | 'lastName'
type FormFields = {
  address?: {
    description: string
    place_id: string
  }
} & Partial<Record<Exclude<Field, 'address'>, string>>

type RnParams = Partial<Record<Exclude<Field, 'address'>, string>> & { address?: string }

function useEncodedInitialValuesQueryParamRaw<T extends FormFields>(initialValues: Required<T>) {
  const searchParams = useSearchParams()

  return useMemo(() => {
    const encodedRn = searchParams?.get('rn')
    if (!encodedRn) {
      return undefined
    }

    try {
      const decoded = atob(encodedRn)
      const userData = JSON.parse(decoded) as RnParams

      const keys = Object.keys(initialValues)
      keys.forEach(key => {
        if ((key as Field) in userData) {
          const index = key as Field
          if (index === 'address') {
            initialValues[index] = {
              description: userData.address ?? '',
              place_id: '',
            }
          } else {
            initialValues[index] = userData[index]
          }
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
  }, [initialValues, searchParams])
}

/**
 * RN app encodes the rn query param using btoa.
 *
 * This hook decodes the rn query param and returns the decoded values.
 *
 * Components using this hook must be wrapped in a Suspense boundary since it uses `useSearchParams`
 */
export function useEncodedInitialValuesQueryParam<T extends FormFields>(
  initialValues: Required<T>,
): [T | undefined, boolean] {
  const decodedInitialValues = useEncodedInitialValuesQueryParamRaw(initialValues)
  const { ready, addressSuggestions } = usePlacesAutocompleteAddress(
    decodedInitialValues?.address?.description ?? '',
  )

  return useMemo(() => {
    if (decodedInitialValues?.address) {
      return [
        {
          ...decodedInitialValues,
          address: {
            description: addressSuggestions?.[0]?.description ?? '',
            place_id: addressSuggestions?.[0]?.place_id ?? '',
          },
        },
        !ready,
      ]
    }

    return [decodedInitialValues, !ready]
  }, [addressSuggestions, decodedInitialValues, ready])
}
