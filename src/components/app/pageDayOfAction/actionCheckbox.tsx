import React from 'react'
import { UserActionType } from '@prisma/client'
import { Loader2Icon } from 'lucide-react'
import { useSWRConfig } from 'swr'

import { actionCreateUserActionViewKeyPage } from '@/actions/actionCreateUserActionViewKeyPage'
import { GetUserPerformedUserActionTypesResponse } from '@/app/api/[countryCode]/identified-user/performed-user-action-types/route'
import { UserActionFormEmailCongresspersonDialog } from '@/components/app/userActionFormEmailCongressperson/dialog'
import { CheckIcon } from '@/components/app/userActionGridCTAs/icons/checkIcon'
import { ExternalLink } from '@/components/ui/link'
import { useLoadingCallback } from '@/hooks/useLoadingCallback'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { apiUrls } from '@/utils/shared/urls'
import {
  USUserActionEmailCampaignName,
  USUserActionViewKeyPageCampaignName,
} from '@/utils/shared/userActionCampaigns/us/usUserActionCampaigns'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

export interface ActionCheckboxProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string
  description: React.ReactNode
  isCompleted: boolean
  isLoading?: boolean
}

const countryCode = DEFAULT_SUPPORTED_COUNTRY_CODE

export function ActionCheckbox({
  title,
  description,
  isCompleted,
  isLoading,
  ...props
}: ActionCheckboxProps) {
  return (
    <button
      className={cn(
        'h-full w-full cursor-pointer rounded-3xl border border-muted shadow-md transition-shadow hover:shadow-lg',
        props.disabled && 'pointer-events-none opacity-75',
      )}
      {...props}
    >
      <div className="flex h-auto w-full items-center gap-4 p-6">
        <div className="h-8 w-8">
          {isLoading ? (
            <Loader2Icon className="h-8 w-8 animate-spin" />
          ) : (
            <CheckIcon
              completed={isCompleted}
              svgClassname="h-8 w-8 border-background box-content bg-muted"
            />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <strong className="text-left font-sans text-sm font-bold text-foreground">{title}</strong>
          <p className="text-left text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  )
}

export function EmailActionCheckbox({
  isCompleted,
  title,
  description,
  campaignName,
}: ActionCheckboxProps & { campaignName: USUserActionEmailCampaignName }) {
  return (
    <UserActionFormEmailCongresspersonDialog campaignName={campaignName} countryCode={countryCode}>
      <ActionCheckbox description={description} isCompleted={isCompleted} title={title} />
    </UserActionFormEmailCongresspersonDialog>
  )
}

export function ViewKeyPageActionCheckbox({
  isCompleted,
  title,
  description,
  campaignName,
  path,
}: ActionCheckboxProps & {
  campaignName: USUserActionViewKeyPageCampaignName
  path: string
}) {
  const { mutate } = useSWRConfig()

  const [onClick, isLoading] = useLoadingCallback(async () => {
    if (isCompleted) {
      return
    }

    await triggerServerActionForForm(
      {
        formName: `View Key Page - ${campaignName}`,
        onError: () => toastGenericError(),
        analyticsProps: {
          'Campaign Name': campaignName,
          'User Action Type': UserActionType.VIEW_KEY_PAGE,
          countryCode: countryCode,
          path,
        },
        payload: {
          campaignName,
          countryCode,
          path,
        },
      },
      payload =>
        actionCreateUserActionViewKeyPage(payload).then(async actionResultPromise => {
          const actionResult = await actionResultPromise

          if (actionResult?.user) {
            identifyUserOnClient(actionResult.user)
            void mutate<GetUserPerformedUserActionTypesResponse>(
              apiUrls.userPerformedUserActionTypes({ countryCode }),
              currentData => {
                return currentData?.performedUserActionTypes.some(
                  x =>
                    x.actionType === UserActionType.VIEW_KEY_PAGE &&
                    x.campaignName === campaignName,
                )
                  ? currentData
                  : {
                      performedUserActionTypes: [
                        ...(currentData?.performedUserActionTypes ?? []),
                        { actionType: UserActionType.VIEW_KEY_PAGE, campaignName },
                      ],
                    }
              },
            )
          }
          return actionResult
        }),
    )
  }, [campaignName, mutate, isCompleted, path])

  return (
    <ExternalLink href={path} onClick={onClick}>
      <ActionCheckbox
        description={description}
        isCompleted={isCompleted}
        isLoading={isLoading}
        title={title}
      />
    </ExternalLink>
  )
}
