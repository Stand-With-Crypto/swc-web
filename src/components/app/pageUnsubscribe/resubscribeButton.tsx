'use client'

import { useForm } from 'react-hook-form'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Form, FormGeneralErrorMessage } from '@/components/ui/form'
import { removeFromGlobalSuppressionGroup } from '@/utils/server/sendgrid/marketing/suppresions'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { toast } from 'sonner'
import { toastGenericError } from '@/utils/web/toastUtils'
import { useRef } from 'react'

const FORM_NAME = 'EMAIL_RESUBSCRIBE'

interface ResubscribeFormValues {
  emailAddress: string
}

export function ResubscribeButton() {
  const hasResubscribed = useRef(false)

  const searchParams = useSearchParams()
  const email = searchParams?.get('email')

  const form = useForm<ResubscribeFormValues>({
    defaultValues: {
      emailAddress: email || '',
    },
  })

  const onSubmit = async ({ emailAddress }: ResubscribeFormValues) => {
    const result = await triggerServerActionForForm(
      {
        form,
        formName: FORM_NAME,
        payload: emailAddress,
      },
      removeFromGlobalSuppressionGroup,
    )

    if (result.status === 'success') {
      toast.success('Successfully resubscribed to our mailing list!')
      hasResubscribed.current = true
    } else {
      toastGenericError()
      hasResubscribed.current = false
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, trackFormSubmissionSyncErrors(FORM_NAME))}>
        {hasResubscribed.current ? (
          <div className="flex max-w-lg flex-col items-center gap-2 pb-8 text-center">
            <p className="text-lg font-semibold">Thank you!</p>
            <p>
              We've gone ahead and updated your email preferences, so you're all set to hear the
              latest news from Stand with Crypto.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 pb-8 ">
            <p className="text-sm text-muted-foreground">
              If you want to resubscribe to our mailing list, please click the button below.
            </p>
            <Button disabled={form.formState.isSubmitting || hasResubscribed.current} type="submit">
              {hasResubscribed.current ? 'Resubscribed' : 'Resubscribe'}
            </Button>
            <FormGeneralErrorMessage control={form.control} />
          </div>
        )}
      </form>
    </Form>
  )
}
