'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'

import {
  actionCreateCoinbaseCommerceCharge,
  ActionCreateCoinbaseCommerceChargeResponse,
} from '@/actions/actionCreateCoinbaseCommerceCharge'
import { Button } from '@/components/ui/button'
import { ErrorBoundary } from '@/utils/web/errorBoundary'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function DonateButton() {
  const [buttonState, setButtonState] = useState<'completed' | 'loading'>('completed')

  const handleDonateClick = async () => {
    const actionCreateCoinbaseCommerceChargeResponse = await triggerServerActionForForm(
      {
        formName: 'Donate Button',
        onError: toastGenericError,
        payload: undefined,
        errorScopeContext: {
          level: 'fatal',
        },
      },
      () => actionCreateCoinbaseCommerceCharge(),
    )

    if (actionCreateCoinbaseCommerceChargeResponse.status !== 'success') {
      Sentry.captureException('Donate button failed', {
        level: 'fatal',
        tags: { domain: 'donate' },
        extra: { response: actionCreateCoinbaseCommerceChargeResponse.response },
      })
      return null
    }

    const commerceChargeResponse =
      actionCreateCoinbaseCommerceChargeResponse.response as ActionCreateCoinbaseCommerceChargeResponse

    if (commerceChargeResponse && 'hostedUrl' in commerceChargeResponse) {
      return commerceChargeResponse.hostedUrl
    } else {
      Sentry.captureException('Donate button returned unexpected response', {
        level: 'fatal',
        tags: { domain: 'donate' },
        extra: { response: actionCreateCoinbaseCommerceChargeResponse.response },
      })
      return null
    }
  }

  return (
    <div className="flex justify-center">
      <ErrorBoundary
        severityLevel="fatal"
        tags={{
          domain: 'DonateButton',
        }}
      >
        <Button
          disabled={buttonState === 'loading'}
          onClick={() => {
            setButtonState('loading')
            const windowRef = window.open()
            void handleDonateClick()
              .then(url => {
                if (url && windowRef) {
                  windowRef.location.href = url
                }
              })
              .finally(() => {
                setButtonState('completed')
              })
          }}
          size="lg"
        >
          Donate
        </Button>
      </ErrorBoundary>
    </div>
  )
}
