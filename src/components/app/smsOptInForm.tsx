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
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

const FORM_NAME = 'SMS opt in form'
const FORM_ID = 'sms-opt-in-form'

export interface SMSOptInFormProps {
  initialValues?: UpdateUserHasOptedInToSMSPayload
  onSuccess?: (formValues: UpdateUserHasOptedInToSMSPayload) => void
  children: (props: {
    form: ReturnType<typeof useForm<UpdateUserHasOptedInToSMSPayload>>
  }) => React.ReactNode
  className?: ClassValue
}

export function SMSOptInForm(props: SMSOptInFormProps) {
  const { initialValues, onSuccess, children, className } = props

  const router = useRouter()

  const form = useForm<UpdateUserHasOptedInToSMSPayload>({
    resolver: zodResolver(zodUpdateUserHasOptedInToSMS),
    defaultValues: initialValues,
  })

  return (
    <Form {...form}>
      <form
        className={cn(className)}
        id={FORM_ID}
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
      >
        {children({
          form,
        })}
      </form>
    </Form>
  )
}

SMSOptInForm.PhoneNumberField = function SMSOptInFormPhoneNumberField({
  className,
}: {
  className?: ClassValue
}) {
  const { control } = useFormContext<UpdateUserHasOptedInToSMSPayload>()

  return (
    <div className={cn('flex', className)}>
      <FormField
        control={control}
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
  return (
    <Button
      className={cn('rounded-md font-semibold', className)}
      form={FORM_ID}
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
