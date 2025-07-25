'use client'

import { Suspense } from 'react'
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
        onError: toastGenericError,
      },
      removeFromGlobalSuppressionGroup,
    )

    if (result.status === 'success') {
      toast.success('Successfully resubscribed to our mailing list!')
      router.push('/embedded/email/resubscribe-success')
    }
  }

  return (
    <Form {...form}>
      <form
        className="pb-8"
        onSubmit={form.handleSubmit(onSubmit, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <Button disabled={form.formState.isSubmitting} size="lg" type="submit">
            Resubscribe
          </Button>
          <FormGeneralErrorMessage control={form.control} />
        </div>
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

export function SuspenseResubscribeButton() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 pb-8">
          <Button disabled>Resubscribe</Button>
        </div>
      }
    >
      <ResubscribeButton />
    </Suspense>
  )
}
