'use client'

import {
  DEFAULT_DISCLAIMER,
  DISCLAIMERS_BY_COUNTRY_CODE,
} from '@/components/app/updateUserProfileForm/step1/constants'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogProps } from '@/components/ui/dialog'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { zodSupportedCountryCode } from '@/validation/fields/zodSupportedCountryCode'

interface CountryCodeDialogProps {
  dialogProps: DialogProps
  addressCountryCode: string
  handleUserAcceptance: () => void
}

export function CountryCodeDisclaimerDialog({
  dialogProps,
  addressCountryCode,
  handleUserAcceptance,
}: CountryCodeDialogProps) {
  const disclaimer = getDisclaimer(addressCountryCode)

  return (
    <Dialog {...dialogProps} open={dialogProps.open}>
      <DialogContent
        a11yTitle="Country Code Disclaimer"
        className="max-w-xl p-6"
        closeClassName="hidden"
        onEscapeKeyDown={e => {
          e.preventDefault()
        }}
        padding={false}
        preventCloseOnEscapeKeyDown
        preventCloseOnInteractOutside
      >
        <div className="flex flex-col gap-4">
          <p>{disclaimer.disclaimer}</p>
          <Button onClick={handleUserAcceptance} variant="primary-cta">
            {disclaimer.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getDisclaimer(countryCode: string) {
  const parsedCountryCode = zodSupportedCountryCode.safeParse(countryCode)

  return parsedCountryCode.data
    ? DISCLAIMERS_BY_COUNTRY_CODE[parsedCountryCode.data as SupportedCountryCodes]
    : DEFAULT_DISCLAIMER
}
