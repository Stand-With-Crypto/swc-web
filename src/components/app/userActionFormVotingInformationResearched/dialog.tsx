'use client'

import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { z } from 'zod'

import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { UserActionFormVotingInformationResearchedProps } from '@/components/app/userActionFormVotingInformationResearched'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserFullProfileInfo } from '@/hooks/useApiResponseForUserFullProfileInfo'
import { useDialog } from '@/hooks/useDialog'
import { useSession } from '@/hooks/useSession'
import { openWindow } from '@/utils/shared/openWindow'
import { getUSStateNameFromStateCode } from '@/utils/shared/usStateUtils'
import { zodAddress } from '@/validation/fields/zodAddress'

import { FORM_NAME } from './formConfig'

const UserActionFormVotingInformationResearched = dynamic(
  () =>
    import('@/components/app/userActionFormVotingInformationResearched').then(
      mod => mod.UserActionFormVotingInformationResearched,
    ),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

const buildElectoralUrl = (address: z.infer<typeof zodAddress>) => {
  const baseUrl = 'https://turbovote.org/'
  const state = address.administrativeAreaLevel1
  const electionDate = '2024-11-05'

  const params = new URLSearchParams({
    street: `${address.streetNumber} ${address.route}`,
    city: getUSStateNameFromStateCode(state),
    state,
    zip: address.postalCode,
  })

  return new URL(`/elections/${state.toLowerCase()}/${electionDate}?${params.toString()}`, baseUrl)
}

interface UserActionFormVotingInformationResearchedDialog
  extends Partial<UserActionFormVotingInformationResearchedProps> {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function UserActionFormVotingInformationResearchedDialog({
  children,
  defaultOpen = false,
  ...formProps
}: UserActionFormVotingInformationResearchedDialog) {
  const searchParams = useSearchParams()

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: FORM_NAME,
  })

  const { user, isLoading } = useSession()
  const { mutate } = useApiResponseForUserFullProfileInfo()

  const handleSuccess = useCallback(
    (address: z.infer<typeof zodAddress>) => {
      void mutate()
      const target = searchParams?.get('target') ?? '_blank'
      const url = buildElectoralUrl(address)
      openWindow(url.toString(), target, `noopener`)
      dialogProps.onOpenChange(false)
    },
    [dialogProps, mutate, searchParams],
  )

  return (
    <UserActionFormDialog {...dialogProps} trigger={children}>
      {isLoading ? (
        <div className="min-h-[400px]">
          <LoadingOverlay />
        </div>
      ) : (
        <UserActionFormVotingInformationResearched
          {...formProps}
          initialValues={{
            address: user?.address
              ? {
                  description: user?.address?.formattedDescription,
                  place_id: user?.address?.googlePlaceId,
                }
              : undefined,
            shouldReceiveNotifications: false,
            ...formProps.initialValues,
          }}
          onSuccess={handleSuccess}
        />
      )}
    </UserActionFormDialog>
  )
}
