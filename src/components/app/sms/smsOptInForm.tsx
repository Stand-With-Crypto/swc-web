'use client'

import { ComponentProps, useEffect, useMemo } from 'react'
import { useForm, useFormContext, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cva } from 'class-variance-authority'
import type { ClassValue } from 'clsx'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  actionUpdateUserHasOptedInToSMS,
  UpdateUserHasOptedInToSMSPayload,
} from '@/actions/actionUpdateUserHasOptedInSMS'
import { GetUserFullProfileInfoResponse } from '@/app/api/identified-user/full-profile-info/route'
import { SMSOptInConsentText } from '@/components/app/sms/smsOptInConsentText'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCountryCode } from '@/hooks/useCountryCode'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { requiresOptInConfirmation } from '@/utils/shared/sms/smsSupportedCountries'
import { userHasOptedInToSMS } from '@/utils/shared/sms/userHasOptedInToSMS'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

const FORM_NAME = 'SMS opt in form'

export interface SMSOptInFormProps extends Omit<ComponentProps<'form'>, 'children'> {
  user: GetUserFullProfileInfoResponse['user']
  onSuccess?: (formValues: UpdateUserHasOptedInToSMSPayload) => void
  children: (props: {
    form: ReturnType<typeof useForm<UpdateUserHasOptedInToSMSPayload>>
  }) => React.ReactNode
}

export function SMSOptInForm(props: SMSOptInFormProps) {
  const { user, onSuccess, children, ...rest } = props

  const countryCode = useCountryCode()
  const router = useRouter()

  const form = useForm<UpdateUserHasOptedInToSMSPayload>({
    resolver: zodResolver(zodUpdateUserHasOptedInToSMS(countryCode)),
    defaultValues: {
      phoneNumber: user?.phoneNumber || '',
      optedInToSms: userHasOptedInToSMS(user),
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async values => {
          const result = await triggerServerActionForForm(
            {
              form,
              formName: FORM_NAME,
              payload: values,
            },
            payload => actionUpdateUserHasOptedInToSMS(payload),
          )
          if (result.status === 'success') {
            router.refresh()
            toast.success('You have opted in to SMS updates', { duration: 5000 })
            onSuccess?.(values)
          }
        }, trackFormSubmissionSyncErrors(FORM_NAME))}
        {...rest}
      >
        {children({
          form,
        })}
      </form>
    </Form>
  )
}

SMSOptInForm.PhoneNumberField = function SMSOptInFormPhoneNumberField({
  shouldAutoFocus = false,
  disabled,
  className,
}: {
  shouldAutoFocus?: boolean
  disabled?: boolean
  className?: ClassValue
}) {
  const { control, setFocus } = useFormContext<UpdateUserHasOptedInToSMSPayload>()

  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (isDesktop && shouldAutoFocus) setFocus('phoneNumber')
  }, [isDesktop, setFocus, shouldAutoFocus])

  return (
    <div className={cn('flex', className)}>
      <FormField
        control={control}
        disabled={disabled}
        name="phoneNumber"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormControl>
              <Input className="h-14 p-4 text-base" placeholder="Phone number" {...field} />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

SMSOptInForm.SubmitButton = function SMSOptInFormSubmitButton({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { formState } = useFormContext<UpdateUserHasOptedInToSMSPayload>()

  return (
    <Button
      className={cn('font-semibold', className)}
      disabled={formState.isSubmitting}
      type="submit"
      {...props}
    >
      {children || 'Get updates'}
    </Button>
  )
}

SMSOptInForm.Footnote = function SMSOptInFormFootnote({
  className,
  consentButtonText = 'Get updates',
  size = 'sm',
  textAlign = 'auto',
  variant = 'default',
}: {
  className?: ClassValue
  consentButtonText?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * @default 'auto'
   * @description If 'auto', the text will be aligned to the left if the country requires opt-in confirmation, otherwise it will be centered.
   */
  textAlign?: 'left' | 'center' | 'auto'
  variant?: 'default' | 'muted'
}) {
  const { control, setValue } = useFormContext<UpdateUserHasOptedInToSMSPayload>()

  const countryCode = useCountryCode()

  const phoneNumber = useWatch({ control, name: 'phoneNumber' })

  const shouldShowSMSOptInCheckbox = useMemo(
    () => requiresOptInConfirmation(countryCode),
    [countryCode],
  )

  useEffect(() => {
    if (!shouldShowSMSOptInCheckbox) {
      setValue('optedInToSms', !!phoneNumber)
    }
  }, [shouldShowSMSOptInCheckbox, phoneNumber, setValue])

  return (
    <FormField
      control={control}
      name="optedInToSms"
      render={({ field }) => (
        <label className="block">
          <FormItem>
            <div className={cn('flex flex-row items-center space-x-3 space-y-0', className)}>
              {shouldShowSMSOptInCheckbox && (
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    variant={variant}
                  />
                </FormControl>
              )}
              <FormDescription
                className={cn({
                  'text-xs': size === 'xs',
                  'text-sm': size === 'sm',
                  'text-base': size === 'md',
                  'text-lg': size === 'lg',
                  'text-left':
                    textAlign === 'left' || (shouldShowSMSOptInCheckbox && textAlign === 'auto'),
                  'text-center':
                    textAlign === 'center' || (!shouldShowSMSOptInCheckbox && textAlign === 'auto'),
                  'text-muted': variant === 'muted',
                })}
              >
                <SMSOptInConsentText
                  consentButtonText={consentButtonText}
                  countryCode={countryCode}
                />
              </FormDescription>
            </div>
            <FormErrorMessage />
          </FormItem>
        </label>
      )}
    />
  )
}
