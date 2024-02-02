'use client'

import { useEmbeddedWallet } from '@thirdweb-dev/react'
import { ChevronLeft } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { dialogButtonStyles } from '@/components/ui/dialog/styles'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageTitle } from '@/components/ui/pageTitleText'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { cn } from '@/utils/web/cn'
import { OTPInput } from '@/components/ui/otpInput'
import { useEffectOnce } from '@/hooks/useEffectOnce'

interface EmailConfirmationProps {
  onConfirm: (code: string) => void
  onBack: () => void
  emailAddress: string
}

const OTP_LENGTH = 6

export function OTPEmailConfirmation({ onConfirm, onBack, emailAddress }: EmailConfirmationProps) {
  const { sendVerificationEmail } = useEmbeddedWallet()
  const [code, setCode] = React.useState('')

  const [sendVerificationEmailWithLoading, isSendingVerificationMail] =
    useLoadingCallback(sendVerificationEmail)

  const sendVerificationEmailToAddress = React.useCallback(() => {
    sendVerificationEmailWithLoading({ email: emailAddress })
  }, [emailAddress, sendVerificationEmailWithLoading])

  useEffectOnce(sendVerificationEmailToAddress)

  const handleConfirm = (syncCode?: string) => {
    const codeToUse = syncCode ?? code

    if (codeToUse.length < OTP_LENGTH) {
      return
    }

    onConfirm(codeToUse)
  }

  const handleChangeOTPInput = (newCode: string) => {
    if (newCode.length === OTP_LENGTH && code.length < OTP_LENGTH) {
      handleConfirm(newCode)
    }

    setCode(newCode)
  }

  return (
    <>
      <GoBackButton onClick={onBack} />
      {isSendingVerificationMail && <LoadingOverlay />}

      <div className="flex min-h-80 w-full flex-col">
        <PageTitle size="sm">Sign in</PageTitle>

        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4">
          <p className="text-center text-muted-foreground">
            Enter the verification code sent to
            <br />
            <strong>{emailAddress}</strong>
          </p>

          <OTPInput
            onChange={handleChangeOTPInput}
            numInputs={OTP_LENGTH}
            disabled={isSendingVerificationMail}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleConfirm()
              }
            }}
          />

          <Button
            size="lg"
            className="w-full"
            onClick={() => handleConfirm()}
            disabled={code.length < OTP_LENGTH}
          >
            Verify
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={sendVerificationEmailToAddress}
          >
            Resend verification code
          </Button>
        </div>
      </div>
    </>
  )
}

function GoBackButton({ onClick }: { onClick: () => void }) {
  return (
    <div role="button" onClick={onClick} className={cn('left-2', dialogButtonStyles)}>
      <ChevronLeft size={16} />
    </div>
  )
}
