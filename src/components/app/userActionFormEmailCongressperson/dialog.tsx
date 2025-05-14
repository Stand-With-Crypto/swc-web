'use client'

import { Suspense, useEffect, useState } from 'react'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/constants'
import { LazyUserActionFormEmailCongressperson } from '@/components/app/userActionFormEmailCongressperson/lazyLoad'
import { UserActionFormEmailCongresspersonSkeleton } from '@/components/app/userActionFormEmailCongressperson/skeleton'
import { UserActionFormEmailCongresspersonSuccess } from '@/components/app/userActionFormEmailCongressperson/success'
import { FormFields } from '@/components/app/userActionFormEmailCongressperson/types'
import { UserActionFormSuccessScreen } from '@/components/app/userActionFormSuccessScreen'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useDialog } from '@/hooks/useDialog'
import { USUserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { cn } from '@/utils/web/cn'

export interface UserActionFormEmailCongresspersonDialogProps extends React.PropsWithChildren {
  defaultOpen?: boolean
  initialValues?: FormFields
  campaignName: USUserActionEmailCampaignName
}

export function UserActionFormEmailCongresspersonDialog({
  children,
  defaultOpen = false,
  initialValues,
  campaignName = USUserActionEmailCampaignName.DEFAULT,
}: UserActionFormEmailCongresspersonDialogProps) {
  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON,
  })
  const countryCode = useCountryCode()
  const fetchUser = useApiResponseForUserFullProfileInfo()
  const [state, setState] = useState<'form' | 'success'>('form')
  const { user } = fetchUser.data || { user: null }
  useEffect(() => {
    if (!dialogProps.open && state !== 'form') {
      setState('form')
    }
  }, [dialogProps.open, state])

  return (
    <UserActionFormDialog {...dialogProps} padding={false} trigger={children}>
      <Suspense
        fallback={
          <UserActionFormEmailCongresspersonSkeleton
            countryCode={countryCode}
            campaignName={campaignName}
          />
        }
      >
        {fetchUser.isLoading ? (
          <UserActionFormEmailCongresspersonSkeleton
            countryCode={countryCode}
            campaignName={campaignName}
          />
        ) : state === 'form' ? (
          <LazyUserActionFormEmailCongressperson
            campaignName={campaignName}
            initialValues={initialValues}
            onCancel={() => dialogProps.onOpenChange(false)}
            onSuccess={() => setState('success')}
            user={user}
          />
        ) : (
          <div className={cn(dialogContentPaddingStyles, 'h-full')}>
            <UserActionFormSuccessScreen onClose={() => dialogProps.onOpenChange(false)}>
              <UserActionFormEmailCongresspersonSuccess />
            </UserActionFormSuccessScreen>
          </div>
        )}
      </Suspense>
    </UserActionFormDialog>
  )
}
