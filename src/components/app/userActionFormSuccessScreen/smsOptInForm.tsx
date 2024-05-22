'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { actionUpdateUserProfile } from '@/actions/actionUpdateUserProfile'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormErrorMessage, FormField, FormItem } from '@/components/ui/form'
import { NextImage } from '@/components/ui/image'
import { Input } from '@/components/ui/input'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { trackFormSubmissionSyncErrors, triggerServerActionForForm } from '@/utils/web/formUtils'
import {
  UpdateProfileWithRequiredFieldsFormValues,
  zodUpdateUserProfileWithRequiredFormFields,
} from '@/validation/forms/zodUpdateUserProfile/zodUpdateUserProfileFormFields'

const FORM_NAME = 'SMS form'

type SMSOptInFormValues = Pick<UpdateProfileWithRequiredFieldsFormValues, 'phoneNumber'>

interface SMSOptInFormProps {
  onSuccess?: () => void
  initialValues?: SMSOptInFormValues
}

export function SMSOptInForm(props: SMSOptInFormProps) {
  const { initialValues, onSuccess } = props

  const router = useRouter()

  const form = useForm<SMSOptInFormValues>({
    resolver: zodResolver(zodUpdateUserProfileWithRequiredFormFields),
    defaultValues: initialValues,
  })

  return (
    <div className="flex h-full flex-col gap-4 text-center">
      <div className="mx-auto">
        <NextImage alt="Shield with checkmark" height={120} src="/logo/shield.svg" width={120} />
      </div>
      <PageTitle size="md">Nice work!</PageTitle>
      <PageSubTitle size="md">
        This is an important year for crypto. Sign up for occasional text updates on important
        legislation, elections, and events in your area.
      </PageSubTitle>

      <Form {...form}>
        <form
          className="flex h-full flex-col gap-4"
          onSubmit={form.handleSubmit(async values => {
            const result = await triggerServerActionForForm(
              {
                form,
                formName: FORM_NAME,
                payload: { ...values, hasOptedInToSms: !!values.phoneNumber },
              },
              payload => actionUpdateUserProfile(payload),
            )
            if (result.status === 'success') {
              router.refresh()
              toast.success('Profile updated', { duration: 5000 })
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
            <p className="mb-4 text-sm text-fontcolor-muted">
              By clicking Get updates, I consent to receive recurring texts from Stand with Crypto.
              You can reply STOP to stop receiving texts. Message and data rates may apply.
            </p>
            <Button
              className="w-full md:w-1/2"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Get updates
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
