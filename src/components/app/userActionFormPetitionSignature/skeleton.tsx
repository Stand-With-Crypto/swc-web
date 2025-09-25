import { formPetitionSignatureI18nMessages } from '@/components/app/userActionFormPetitionSignature'
import { FormContainer } from '@/components/app/userActionFormPetitionSignature/container'
import { Footer } from '@/components/app/userActionFormPetitionSignature/footer'
import { PetitionHeader } from '@/components/app/userActionFormPetitionSignature/header'
import { PrivacyNotice } from '@/components/app/userActionFormPetitionSignature/privacyNotice'
import { Button } from '@/components/ui/button'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useTranslation } from '@/utils/web/i18n/useTranslation'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { mergeI18nMessages } from '@/utils/shared/i18n/mergeI18nMessages'

const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      loadingPetition: 'Loading petition...',
    },
    de: {
      loadingPetition: 'Petition wird geladen...',
    },
    fr: {
      loadingPetition: 'Chargement de la pétition...',
    },
  },
})

export function UserActionFormPetitionSignatureSkeleton() {
  const { t } = useTranslation(
    mergeI18nMessages(formPetitionSignatureI18nMessages, i18nMessages),
    'UserActionFormPetitionSignatureSkeleton',
  )

  return (
    <div className="flex h-full flex-col space-y-0 pb-40">
      <LoadingOverlay />

      <PetitionHeader
        goal={100000}
        petitionSlug={undefined}
        signaturesCount={33000}
        title={t('loadingPetition')}
      />

      <FormContainer>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormItemSkeleton>
            <label>{t('firstName')}</label>
            <Input placeholder={t('firstNamePlaceholder')} />
          </FormItemSkeleton>
          <FormItemSkeleton>
            <label>{t('lastName')}</label>
            <Input placeholder={t('lastNamePlaceholder')} />
          </FormItemSkeleton>
        </div>

        <FormItemSkeleton>
          <label>{t('email')}</label>
          <Input placeholder={t('emailPlaceholder')} />
        </FormItemSkeleton>

        <FormItemSkeleton>
          <label>{t('address')}</label>
          <Input placeholder={t('addressPlaceholder')} />
        </FormItemSkeleton>
      </FormContainer>

      <div>
        <Footer>
          <PrivacyNotice />
          <Button className="h-12 w-full" disabled size="default" type="submit">
            {t('sign')}
          </Button>
        </Footer>
      </div>
    </div>
  )
}
