import React, { useCallback } from 'react'
import { Edit3Icon } from 'lucide-react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { UserActionFormPetitionSignatureDialog } from '@/components/app/userActionFormPetitionSignature/dialog'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { Button } from '@/components/ui/button'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

interface PetitionSummaryFooterProps {
  isClosed?: boolean
  isSigned?: boolean
  petitionSlug?: string
  countryCode: SupportedCountryCodes
  isLoading?: boolean
  onPetitionSigned?: () => void
}

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      signPetition: 'Sign petition',
      sign: 'Sign',
      petitionClosed: 'Petition closed',
      closed: 'Closed',
      signed: 'Signed',
    },
    de: {
      signPetition: 'Petition unterschreiben',
      sign: 'Unterzeichnen',
      petitionClosed: 'Petition geschlossen',
      closed: 'Geschlossen',
      signed: 'Unterschrieben',
    },
    fr: {
      signPetition: 'Signez cette pétition',
      sign: 'Signer',
      petitionClosed: 'Pétition close',
      closed: 'Close',
      signed: 'Signé',
    },
  },
})

export function PetitionSummaryFooter({
  isClosed,
  isSigned,
  petitionSlug,
  countryCode,
  isLoading,
  onPetitionSigned,
}: PetitionSummaryFooterProps) {
  const { t } = useTranslation(i18nMessages, 'PetitionSummaryFooter')

  const handleDialogSuccess = useCallback(() => {
    onPetitionSigned?.()
  }, [onPetitionSigned])

  const renderSignButton = (
    <Button className="w-full gap-2 px-6" disabled={isLoading} variant="primary-cta">
      <Edit3Icon size={16} />
      <span className="hidden lg:inline">{t('signPetition')}</span>
      <span className="block lg:hidden">{t('sign')}</span>
    </Button>
  )

  if (isClosed) {
    return (
      <div className="flex h-11 w-full items-center justify-center rounded-full bg-foreground/10 px-6 font-medium text-muted-foreground lg:w-full">
        <span className="hidden lg:block">{t('petitionClosed')}</span>
        <span className="block lg:hidden">{t('closed')}</span>
      </div>
    )
  }

  if (isSigned) {
    return (
      <div className="flex h-11 w-max items-center justify-center gap-2 lg:w-full lg:px-6">
        <CheckIcon completed />
        <p className="font-medium text-foreground">{t('signed')}</p>
      </div>
    )
  }

  return (
    <LoginDialogWrapper
      authenticatedContent={
        <UserActionFormPetitionSignatureDialog
          countryCode={countryCode}
          onSuccess={handleDialogSuccess}
          petitionSlug={petitionSlug}
        >
          {renderSignButton}
        </UserActionFormPetitionSignatureDialog>
      }
    >
      {renderSignButton}
    </LoginDialogWrapper>
  )
}
