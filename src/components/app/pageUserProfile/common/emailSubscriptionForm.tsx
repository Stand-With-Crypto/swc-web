'use client'

import { ComponentProps, useRef, useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { PageUserProfileUser } from '@/components/app/pageUserProfile/common/getAuthenticatedData'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useEmailUnsubscriptionStatus } from '@/hooks/useEmailUnsubscriptionStatus'
import {
  addToGlobalSuppressionGroup,
  removeFromGlobalSuppressionGroup,
} from '@/utils/server/sendgrid/marketing/suppresions'
import { cn } from '@/utils/web/cn'
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

  const isEmailFieldDisabled = !emailAddress || isSubmitting || isFirstLoad.current

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 md:items-center">
          <CheckboxField
            checked={!isUnsubscribed}
            disabled={isEmailFieldDisabled}
            helpText={
              !emailAddress
                ? 'Please provide an email address to subscribe to our mailing list.'
                : ''
            }
            isLoading={isSubmitting || isFirstLoad.current}
            label="Email"
            onCheckedChange={handleEmailOptInChange}
          >
            {isFirstLoad.current ? <Skeleton className="h-4 w-4" /> : null}
          </CheckboxField>
          <p className="text-sm text-muted-foreground">
            We'll send you emails about our campaigns, latest crypto policy news, your NFTs status,
            and more.
          </p>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface CheckboxFieldProps extends ComponentProps<typeof Checkbox> {
  label: string
  helpText: string
  isLoading: boolean
}

function CheckboxField({ label, helpText, isLoading, children, ...props }: CheckboxFieldProps) {
  return (
    <div className="relative flex w-fit items-center gap-2 pr-6">
      <label
        className={cn('flex cursor-pointer items-center gap-2', {
          'cursor-not-allowed text-muted-foreground': props.disabled,
        })}
      >
        {children || <Checkbox {...props} />}
        <p>{label}</p>
      </label>

      {helpText ? (
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>{helpText}</TooltipContent>
        </Tooltip>
      ) : null}

      {isLoading ? <Loader2 className="absolute right-0 h-4 w-4 animate-spin" /> : null}
    </div>
  )
}
