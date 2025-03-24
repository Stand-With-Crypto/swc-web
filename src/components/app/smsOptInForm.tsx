'use client'

import { ComponentProps, useEffect } from 'react'
import { useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ClassValue } from 'clsx'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  actionUpdateUserHasOptedInToSMS,
  UpdateUserHasOptedInToSMSPayload,
} from '@/actions/actionUpdateUserHasOptedInSMS'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

const FORM_NAME = 'SMS opt in form'

export interface SMSOptInFormProps extends Omit<ComponentProps<'form'>, 'children'> {
  initialValues?: UpdateUserHasOptedInToSMSPayload
  onSuccess?: (formValues: UpdateUserHasOptedInToSMSPayload) => void
  children: (props: {
    form: ReturnType<typeof useForm<UpdateUserHasOptedInToSMSPayload>>
  }) => React.ReactNode
}

export function SMSOptInForm(props: SMSOptInFormProps) {
  const { initialValues, onSuccess, children, ...rest } = props

  const router = useRouter()

  const form = useForm<UpdateUserHasOptedInToSMSPayload>({
    resolver: zodResolver(zodUpdateUserHasOptedInToSMS),
    defaultValues: initialValues,
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

SMSOptInForm.Footnote = function SMSOptInFormFootnote({ className }: { className?: ClassValue }) {
  return (
    <p className={cn('text-sm text-fontcolor-muted', className)}>
      By clicking Get updates, I consent to receive recurring texts from Stand with Crypto. You can
      reply STOP to stop receiving texts. Message and data rates may apply.
    </p>
  )
}
