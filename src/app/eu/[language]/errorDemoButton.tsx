'use client'

import { useState } from 'react'

import {
  catchUnexpectedServerErrorAndTriggerToast,
  toastGenericError,
} from '@/utils/web/toastUtils'

import { trigger401Error, trigger500Error, triggerGenericError } from './errorActions'

export function ErrorDemoButton() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleError = async (errorType: 'generic' | '401' | '500' | 'client') => {
    setIsLoading(errorType)

    try {
      switch (errorType) {
        case 'generic':
          await triggerGenericError()
          break
        case '401':
          await trigger401Error()
          break
        case '500':
          await trigger500Error()
          break
        case 'client':
          // Client-side error using toastGenericError directly
          toastGenericError()
          setIsLoading(null)
          return
      }
    } catch (error) {
      // Use catchUnexpectedServerErrorAndTriggerToast to handle the error
      catchUnexpectedServerErrorAndTriggerToast(error)
    } finally {
      setIsLoading(null)
    }
  }

  const buttonClass =
    'px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const primaryButtonClass = `${buttonClass} bg-red-600 text-white hover:bg-red-700`
  const secondaryButtonClass = `${buttonClass} bg-orange-600 text-white hover:bg-orange-700`
  const tertiaryButtonClass = `${buttonClass} bg-yellow-600 text-white hover:bg-yellow-700`
  const clientButtonClass = `${buttonClass} bg-blue-600 text-white hover:bg-blue-700`

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          className={primaryButtonClass}
          disabled={isLoading === 'generic'}
          onClick={() => handleError('generic')}
        >
          {isLoading === 'generic' ? 'Loading...' : 'Generic Error'}
        </button>

        <button
          className={secondaryButtonClass}
          disabled={isLoading === '401'}
          onClick={() => handleError('401')}
        >
          {isLoading === '401' ? 'Loading...' : '401 Unauthorized'}
        </button>

        <button
          className={tertiaryButtonClass}
          disabled={isLoading === '500'}
          onClick={() => handleError('500')}
        >
          {isLoading === '500' ? 'Loading...' : '500 Server Error'}
        </button>

        <button
          className={clientButtonClass}
          disabled={isLoading === 'client'}
          onClick={() => handleError('client')}
        >
          Client Toast Error
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p className="mb-2">
          <strong>What each button does:</strong>
        </p>
        <ul className="space-y-1 text-xs">
          <li>
            <strong>Generic Error:</strong> Triggers a server error →
            catchUnexpectedServerErrorAndTriggerToast → toastGenericError
          </li>
          <li>
            <strong>401 Unauthorized:</strong> Triggers a 401 FetchReqError → shows translated
            "Please login first" message
          </li>
          <li>
            <strong>500 Server Error:</strong> Triggers a 500 FetchReqError → shows generic error
            description
          </li>
          <li>
            <strong>Client Toast Error:</strong> Directly calls toastGenericError() on the client
          </li>
        </ul>
      </div>
    </div>
  )
}
