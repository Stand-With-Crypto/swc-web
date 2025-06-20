'use client'

import { Suspense, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form, FormGeneralErrorMessage } from '@/components/ui/form'
import { removeFromGlobalSuppressionGroup } from '@/utils/server/sendgrid/marketing/suppresions'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import { toastGenericError } from '@/utils/web/toastUtils'

const FORM_NAME = 'EMAIL_RESUBSCRIBE'

interface ResubscribeFormValues {
  emailAddress: string
}

function ResubscribeButton() {
  const router = useRouter()

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
      router.push('/embedded/email/resubscribe-success')
    } else {
      toastGenericError()
      hasResubscribed.current = false
    }
  }

  return (
    <Form {...form}>
      <form
        className="pb-8"
        onSubmit={form.handleSubmit(onSubmit, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        {hasResubscribed.current ? (
          <ResubscribeButton.Success />
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <ResubscribeButton.ResubscribeText />
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

ResubscribeButton.ResubscribeText = function ResubscribeText() {
  return (
    <div className="flex max-w-xl flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">
        Changed your mind? Resubscribe to our mailing list for the latest crypto policy updates and
        ways to take action.
      </p>
    </div>
  )
}

ResubscribeButton.Success = function Success() {
  return (
    <div className="max-w-lg gap-2 text-center">
      <p className="text-lg font-semibold">Thank you!</p>
      <p>
        We've gone ahead and updated your email preferences, so you're all set to hear the latest
        news from Stand with Crypto.
      </p>
    </div>
  )
}

export function SuspenseResubscribeButton() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 pb-8">
          <ResubscribeButton.ResubscribeText />
          <Button disabled>Resubscribed</Button>
        </div>
      }
    >
      <ResubscribeButton />
    </Suspense>
  )
}
