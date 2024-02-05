'use client'
import React from 'react'
import { Button } from '@/components/ui/button'
import { actionCreateCoinbaseCommerceCharge } from '@/actions/actionCreateCoinbaseCommerceCharge'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'

export function DonateButton() {
  const [buttonState, setButtonState] = React.useState<'completed' | 'loading'>('completed')

  const handleDonateClick = async () => {
    setButtonState('loading')
    try {
      window.open(await actionCreateCoinbaseCommerceCharge(), '_blank')
    } catch (error) {
      catchUnexpectedServerErrorAndTriggerToast(error)
    }
    setButtonState('completed')
  }
  return (
    <div className="flex justify-center">
      <Button
        size="lg"
        disabled={buttonState === 'loading'}
        onClick={() => {
          handleDonateClick()
        }}
      >
        Donate
      </Button>
    </div>
  )
}
