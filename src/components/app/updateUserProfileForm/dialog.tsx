'use client'

import { Suspense } from 'react'

import { UpdateUserProfileFormContainer } from '@/components/app/updateUserProfileForm'
import { ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM } from '@/components/app/updateUserProfileForm/constants'
import { LazyUpdateUserProfileForm } from '@/components/app/updateUserProfileForm/lazyLoad'
import { OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY } from '@/components/app/updateUserProfileForm/queryParamConfig'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useQueryParamDialog } from '@/hooks/useQueryParamDialog'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      updateUserProfileForm: 'Update user form',
    },
    fr: {
      updateUserProfileForm: 'Mettre à jour le profil',
    },
    de: {
      updateUserProfileForm: 'Benutzerprofil aktualisieren',
    },
  },
})

export function UpdateUserProfileFormDialog({
  children,
  ...formProps
}: Omit<React.ComponentProps<typeof UpdateUserProfileFormContainer>, 'onCancel' | 'onSuccess'> & {
  children: React.ReactNode
  onSuccess?: () => void
}) {
  const { t } = useTranslation(i18nMessages)

  const dialogProps = useQueryParamDialog({
    queryParamKey: OPEN_UPDATE_USER_PROFILE_FORM_QUERY_PARAM_KEY,
  })
  return (
    <Dialog analytics={ANALYTICS_NAME_UPDATE_USER_PROFILE_FORM} {...dialogProps}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent a11yTitle={t('updateUserProfileForm')} className="max-w-xl px-0 md:px-0">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <LazyUpdateUserProfileForm
            {...formProps}
            onSuccess={() => {
              dialogProps.onOpenChange?.(false)
              formProps.onSuccess?.()
            }}
          />
        </Suspense>
      </DialogContent>
    </Dialog>
  )
}
