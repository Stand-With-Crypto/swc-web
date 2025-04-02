'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import { UserActionType } from '@prisma/client'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import {
  actionCreateUserActionVoterAttestation,
  CreateActionVoterAttestationInput,
} from '@/actions/actionCreateUserActionVoterAttestation'
import { ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED } from '@/components/app/pageVoterGuide/constants/us/usCtas'
import { getDefaultValues } from '@/components/app/pageVoterGuide/formConfig'
import { UserActionFormDialog } from '@/components/app/userActionFormCommon/dialog'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { useApiResponseForUserPerformedUserActionTypes } from '@/hooks/useApiResponseForUserPerformedUserActionTypes'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useDialog } from '@/hooks/useDialog'
import { useSession } from '@/hooks/useSession'
import { convertAddressToAnalyticsProperties } from '@/utils/shared/sharedAnalytics'
import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'
import { DEFAULT_SUPPORTED_COUNTRY_CODE } from '@/utils/shared/supportedCountries'
import { UserActionVoterAttestationCampaignName } from '@/utils/shared/userActionCampaigns'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  convertGooglePlaceAutoPredictionToAddressSchema,
  GooglePlaceAutocompletePrediction,
} from '@/utils/web/googlePlaceUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

import { SaveProgressToast } from './saveProgressToast'

const KeyRacesForm = dynamic(
  () => import('@/components/app/pageVoterGuide/keyRacesForm').then(mod => mod.KeyRacesForm),
  {
    loading: () => (
      <div className="min-h-[400px]">
        <LoadingOverlay />
      </div>
    ),
  },
)

interface KeyRacesDialogProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function KeyRacesDialog({ children, defaultOpen }: KeyRacesDialogProps) {
  const countryCode = useCountryCode()
  const router = useRouter()

  const session = useSession()
  const user = session?.user
  const { mutate } = useApiResponseForUserPerformedUserActionTypes()

  const [toastOpen, setToastOpen] = useState(false)
  useEffect(() => {
    if (toastOpen && session.isLoggedIn) {
      setToastOpen(false)
    }
  }, [session.isLoggedIn, toastOpen])

  const dialogProps = useDialog({
    initialOpen: defaultOpen,
    analytics: ANALYTICS_NAME_USER_ACTION_FORM_GET_INFORMED,
  })

  const handleViewKeyRacesActionSuccess = useCallback(() => {
    if (!session.isLoggedIn) {
      setToastOpen(true)
    }
  }, [session.isLoggedIn])

  const handleCreateVoterPledgeAction = useCallback(
    async (address: GooglePlaceAutocompletePrediction) => {
      const addressSchema = await convertGooglePlaceAutoPredictionToAddressSchema(address)

      if (!addressSchema) {
        throw new Error('Invalid address')
      }

      const data: CreateActionVoterAttestationInput = {
        campaignName: UserActionVoterAttestationCampaignName['H1_2025'],
        address: addressSchema,
        stateCode: addressSchema.administrativeAreaLevel1 as USStateCode,
        shouldBypassAuth: true,
      }

      const result = await triggerServerActionForForm(
        {
          formName: 'User Action Form Voter Attestation',
          analyticsProps: {
            ...convertAddressToAnalyticsProperties(data.address),
            'Campaign Name': data.campaignName,
            'User Action Type': UserActionType.VOTER_ATTESTATION,
          },
          payload: data,
          onError: toastGenericError,
        },
        payload => actionCreateUserActionVoterAttestation(payload),
      )

      if (result.status === 'error') {
        return toastGenericError()
      }

      router.refresh()
      void mutate()
    },
    [mutate, router],
  )

  return (
    <>
      <UserActionFormDialog
        {...dialogProps}
        bypassCountryCheck={countryCode !== DEFAULT_SUPPORTED_COUNTRY_CODE}
        padding={false}
        trigger={children}
      >
        {session?.isLoading ? (
          <div className="min-h-[400px]">
            <LoadingOverlay />
          </div>
        ) : (
          <KeyRacesForm
            initialValues={getDefaultValues({ user })}
            onSubmit={async formData => {
              await handleCreateVoterPledgeAction(formData.address)
              dialogProps.onOpenChange(false)
            }}
            onViewKeyRacesActionSuccess={handleViewKeyRacesActionSuccess}
          />
        )}
      </UserActionFormDialog>

      <SaveProgressToast isOpen={toastOpen} onClose={() => setToastOpen(false)} />
    </>
  )
}
