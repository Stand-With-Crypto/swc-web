'use client'

import { useMemo, useState } from 'react'
import { UserActionType } from '@prisma/client'
import { usePathname } from 'next/navigation'

import {
  actionCreateUserActionViewKeyPage,
  CreateActionViewKeyPageInput,
} from '@/actions/actionCreateUserActionViewKeyPage'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getActionDefaultCampaignName } from '@/utils/shared/userActionCampaigns'
import { BuilderComponentAttributes } from '@/utils/web/builder/types'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { identifyUserOnClient } from '@/utils/web/identifyUser'
import { toastGenericError } from '@/utils/web/toastUtils'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'newmode-embed': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            action: string
            base: string
          },
          HTMLElement
        >
      }
    }
  }
}

export interface NewModeProps {
  campaignId: string
  actionName: string
}

export function NewMode({
  campaignId,
  actionName,
  ...props
}: NewModeProps & BuilderComponentAttributes) {
  const [shouldCaptureAction, setShouldCaptureAction] = useState(true)

  const { data: userActionData, isLoading: isLoadingPerformedUserAction } =
    useApiResponseForUserPerformedUserActionTypes()
  const countryCode = useCountryCode()
  const pathname = usePathname()

  const campaignName = useMemo(() => {
    const normalizedActionName = actionName.toUpperCase().trim()

    return normalizedActionName === 'DEFAULT'
      ? getActionDefaultCampaignName(UserActionType.VIEW_KEY_PAGE, countryCode)
      : normalizedActionName
  }, [actionName, countryCode])

  const hasPerformedUserAction = useMemo(
    () =>
      userActionData?.performedUserActionTypes.some(
        action =>
          action.actionType === UserActionType.VIEW_KEY_PAGE &&
          action.campaignName === campaignName,
      ),
    [userActionData, campaignName],
  )

  const handleIframeClick = () => {
    if (hasPerformedUserAction) {
      setShouldCaptureAction(false)
      return
    }

    if (isLoadingPerformedUserAction) {
      return
    }

    if (pathname && shouldCaptureAction) {
      void handleViewKeyPageAction({
        countryCode,
        campaignName,
        path: pathname,
      }).then(() => {
        setShouldCaptureAction(false)
      })
    }
  }

  return (
    <newmode-embed
      {...props}
      action={campaignId}
      base="https://base.newmode.net"
      onClick={handleIframeClick}
    ></newmode-embed>
  )
}

async function handleViewKeyPageAction({
  countryCode,
  campaignName,
  path,
}: {
  countryCode: SupportedCountryCodes
  campaignName: string
  path: string
}) {
  const data: CreateActionViewKeyPageInput = {
    countryCode,
    path: path.replace(`/${countryCode}/`, '/'),
    campaignName,
  }

  const result = await triggerServerActionForForm(
    {
      formName: 'View Key Page',
      onError: () => toastGenericError(),
      analyticsProps: {
        'Campaign Name': data.campaignName,
        'User Action Type': UserActionType.VIEW_KEY_PAGE,
        countryCode: data.countryCode,
        path: data.path,
      },
      payload: data,
    },
    payload =>
      actionCreateUserActionViewKeyPage(payload).then(async actionResultPromise => {
        const actionResult = await actionResultPromise

        if (actionResult?.user) {
          identifyUserOnClient(actionResult.user)
        }
        return actionResult
      }),
  )

  if (result.status !== 'success') {
    toastGenericError()
  }
}
