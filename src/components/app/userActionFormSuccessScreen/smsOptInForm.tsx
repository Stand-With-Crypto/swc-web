'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  actionUpdateUserHasOptedInToSMS,
  UpdateUserHasOptedInToSMSPayload,
} from '@/actions/actionUpdateUserHasOptedInSMS'
import { UserActionFormSuccessScreenFeedback } from '@/components/app/userActionFormSuccessScreen/UserActionFormSuccessScreenFeedback'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { NextImage } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { zodUpdateUserHasOptedInToSMS } from '@/validation/forms/zodUpdateUserHasOptedInToSMS'

const FORM_NAME = 'SMS opt in form'

interface SMSOptInFormProps {
  onSuccess?: () => void
  initialValues?: UpdateUserHasOptedInToSMSPayload
}

export function SMSOptInForm(props: SMSOptInFormProps) {
  const { initialValues, onSuccess } = props

  const router = useRouter()

  const form = useForm<UpdateUserHasOptedInToSMSPayload>({
    resolver: zodResolver(zodUpdateUserHasOptedInToSMS),
    defaultValues: initialValues,
  })

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col gap-4"
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
            onSuccess?.()
          }
        }, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input className="h-14 p-4 text-base" placeholder="Phone number" {...field} />
              </FormControl>
              <FormErrorMessage />
            </FormItem>
          )}
        />

        <div className="mt-auto">
          <p className="mb-4 text-sm text-fontcolor-muted lg:mb-8">
            By clicking Get updates, I consent to receive recurring texts from Stand with Crypto.
            You can reply STOP to stop receiving texts. Message and data rates may apply.
          </p>
          <Button
            className="w-full md:max-w-[300px]"
            disabled={form.formState.isSubmitting}
            size="lg"
            type="submit"
          >
            Get updates
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface SMSOptInContentProps extends SMSOptInFormProps {}

export function SMSOptInContent(props: SMSOptInContentProps) {
  return (
    <div className="flex h-full flex-col gap-4 text-center">
      <UserActionFormSuccessScreenFeedback
        Image={
          <NextImage alt="Shield with checkmark" height={120} src="/logo/shield.svg" width={120} />
        }
        description="This is an important year for crypto. Sign up for occasional text updates on important legislation, elections, and events in your area."
        title="Nice work!"
      />

      <SMSOptInForm {...props} />
    </div>
  )
}

SMSOptInContent.Skeleton = function SMSOptInContentSkeleton() {
  return (
    <div className="space-y-8">
      <UserActionFormSuccessScreenFeedback.Skeleton />

      <Skeleton className="mx-auto h-14 w-full max-w-[450px]" />
    </div>
  )
}
