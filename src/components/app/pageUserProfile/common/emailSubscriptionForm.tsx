'use client'

import { useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { CommunicationsPreferenceForm } from '@/components/app/pageUserProfile/common/communicationsPreferenceForm'
import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmailUnsubscriptionStatus } from '@/hooks/useEmailUnsubscriptionStatus'
import {
  addToGlobalSuppressionGroup,
  removeFromGlobalSuppressionGroup,
} from '@/utils/server/sendgrid/marketing/suppresions'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

const FORM_NAME = 'User Communication Preferences'

interface EmailSubscriptionFormProps {
  user: PageUserProfileUser
}

export function EmailSubscriptionForm({ user }: EmailSubscriptionFormProps) {
  const { primaryUserEmailAddress } = user
  const emailAddress = primaryUserEmailAddress?.emailAddress ?? ''

  const [isSubmitting, setIsSubmitting] = useState(false)
  const isFirstLoad = useRef(true)
  const { data: isUnsubscribed, mutate } = useEmailUnsubscriptionStatus(emailAddress, {
    onSuccess: () => {
      isFirstLoad.current = false
    },
    onError: () => {
      isFirstLoad.current = false
    },
    onLoadingSlow: () => {
      isFirstLoad.current = false
    },
  })

  const handleEmailOptInChange = async (emailOptIn: boolean) => {
    setIsSubmitting(true)
    const action = emailOptIn
      ? removeFromGlobalSuppressionGroup
      : async () => addToGlobalSuppressionGroup([emailAddress])

    const result = await triggerServerActionForForm(
      {
        formName: FORM_NAME,
        payload: emailAddress,
        onError: toastGenericError,
      },
      action,
    )

    if (result.status === 'success') {
      await mutate()
      toast.success(
        emailOptIn
          ? 'Successfully subscribed to our emails!'
          : 'Successfully unsubscribed from our emails!',
      )
    }

    setIsSubmitting(false)
  }

  const helpText = useMemo(() => {
    if (!emailAddress) {
      return 'Please provide an email address to subscribe to our emails.'
    }
    return ''
  }, [emailAddress])

  const isEmailFieldDisabled = !emailAddress || isSubmitting || isFirstLoad.current

  return (
    <CommunicationsPreferenceForm.FormItem disclaimerText="We'll send you emails about our campaigns, latest crypto policy news, your NFTs status, and more.">
      <CommunicationsPreferenceForm.CheckboxField
        checked={!isUnsubscribed}
        disabled={isEmailFieldDisabled}
        helpText={helpText}
        isLoading={isSubmitting || isFirstLoad.current}
        label="Email"
        onCheckedChange={handleEmailOptInChange}
      >
        {isFirstLoad.current ? <Skeleton className="h-4 w-4" /> : null}
      </CommunicationsPreferenceForm.CheckboxField>
    </CommunicationsPreferenceForm.FormItem>
  )
}
