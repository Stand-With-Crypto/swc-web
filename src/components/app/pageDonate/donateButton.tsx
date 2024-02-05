'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { actionCreateCoinbaseCommerceCharge } from '@/actions/actionCreateCoinbaseCommerceCharge'
import { toastGenericError } from '@/utils/web/toastUtils'
import { triggerServerActionForForm } from '@/utils/web/formUtils'

export function DonateButton() {
  const [buttonState, setButtonState] = React.useState<'completed' | 'loading'>('completed')

  const handleDonateClick = async () => {
    setButtonState('loading')
    await triggerServerActionForForm(
      {
        formName: 'Donate Button',
        onError: toastGenericError,
      },
      () =>
        actionCreateCoinbaseCommerceCharge().then(res => {
          window.open(res.hostedUrl, '_blank')
          return res
        }),
    )
    setButtonState('completed')
  }
  return (
    <div className="flex justify-center">
      <Button size="lg" disabled={buttonState === 'loading'} onClick={handleDonateClick}>
        Donate
      </Button>
    </div>
  )
}
