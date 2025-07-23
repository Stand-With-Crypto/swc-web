'use client'

import { ComponentProps, useMemo, useRef, useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/web/cn'
import { triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'
import { userHasOptedInToSMS } from '@/utils/shared/sms/userHasOptedInToSMS'
import { actionUpdateUserHasOptedInToSMS } from '@/actions/actionUpdateUserHasOptedInSMS'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { SMSOptInConsentText } from '@/components/app/sms/smsOptInConsentText'
import { CommunicationsPreferenceForm } from '@/components/app/pageUserProfile/common/communicationsPreferenceForm'

const FORM_NAME = 'User Communication Preferences'

interface SMSSubscriptionFormProps {
  user: PageUserProfileUser
  countryCode: SupportedCountryCodes
}

export function SMSSubscriptionForm({ user, countryCode }: SMSSubscriptionFormProps) {
  const { phoneNumber } = user

  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasOptedInToSMS = userHasOptedInToSMS(user)

  const handleSMSOptInChange = async (smsOptIn: boolean) => {
    setIsSubmitting(true)

    const payload = {
      phoneNumber,
      optedInToSms: smsOptIn,
    }
    const result = await triggerServerActionForForm(
      {
        formName: FORM_NAME,
        onError: toastGenericError,
        payload,
      },
      actionUpdateUserHasOptedInToSMS,
    )

    if (result.status === 'success') {
      toast.success(
        smsOptIn
          ? 'Successfully subscribed to our text messages!'
          : 'Successfully unsubscribed from our text messages!',
      )
    }

    setIsSubmitting(false)
  }

  const helpText = useMemo(() => {
    if (!phoneNumber) {
      return 'Please provide a phone number to subscribe to our text messages.'
    }
    if (hasOptedInToSMS) {
      return 'To opt-out at any time reply "STOP".'
    }
    return ''
  }, [phoneNumber, hasOptedInToSMS])

  const isSMSFieldDisabled = !phoneNumber || isSubmitting || hasOptedInToSMS

  return (
    <CommunicationsPreferenceForm.FormItem disclaimerText={SMSOptInConsentText({ countryCode })}>
      <CommunicationsPreferenceForm.CheckboxField
        checked={hasOptedInToSMS}
        disabled={isSMSFieldDisabled}
        helpText={helpText}
        isLoading={isSubmitting}
        label="SMS"
        onCheckedChange={handleSMSOptInChange}
      />
    </CommunicationsPreferenceForm.FormItem>
  )
}
