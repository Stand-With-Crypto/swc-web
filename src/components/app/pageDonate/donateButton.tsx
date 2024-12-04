'use client'
import React from 'react'

import { actionCreateCoinbaseCommerceCharge } from '@/actions/actionCreateCoinbaseCommerceCharge'
import { Button } from '@/components/ui/button'
import { openWindow } from '@/utils/shared/openWindow'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

export function DonateButton() {
  const [buttonState, setButtonState] = React.useState<'completed' | 'loading'>('completed')

  const handleDonateClick = async () => {
    setButtonState('loading')
    await triggerServerActionForForm(
      {
        formName: 'Donate Button',
        onError: toastGenericError,
        payload: undefined,
        errorScopeContext: {
          level: 'fatal',
        },
      },
      () =>
        actionCreateCoinbaseCommerceCharge().then(
          async actionCreateCoinbaseCommerceChargeResponse => {
            const commerceChargeResponse = await actionCreateCoinbaseCommerceChargeResponse
            if (commerceChargeResponse && 'hostedUrl' in commerceChargeResponse) {
              const windowReference = openWindow(commerceChargeResponse.hostedUrl, '_blank', '')
              if (!windowReference) {
                openWindow(commerceChargeResponse.hostedUrl, '_self')
              }
            }
            return commerceChargeResponse
          },
        ),
    )
    setButtonState('completed')
  }
  return (
    <div className="flex justify-center">
      <Button disabled={buttonState === 'loading'} onClick={handleDonateClick} size="lg">
        Donate
      </Button>
    </div>
  )
}
