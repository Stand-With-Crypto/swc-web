'use client'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserInformationVisibility } from '@prisma/client'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'

import { actionUpdateUserInformationVisibility } from '@/actions/actionUpdateUserInformationVisibility'
import { ClientAddress } from '@/clientModels/clientAddress'
import { SensitiveDataClientUserWithENSData } from '@/clientModels/clientUser/sensitiveDataClientUser'
import { UserAvatar } from '@/components/app/userAvatar'
import { Button } from '@/components/ui/button'
import { Form, FormErrorMessage, FormField, FormGeneralErrorMessage } from '@/components/ui/form'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { cn } from '@/utils/web/cn'
import {
  GenericErrorFormValues,
  trackFormSubmissionSyncErrors,
  triggerServerActionForForm,
} from '@/utils/web/formUtils'
import { getUserDisplayName, USER_INFORMATION_VISIBILITY_ORDERED_LIST } from '@/utils/web/userUtils'
import { zodUpdateUserInformationVisibility } from '@/validation/forms/zodUpdateUserInformationVisibility'

const FORM_NAME = 'User Information Visibility'
type FormValues = z.infer<typeof zodUpdateUserInformationVisibility> & GenericErrorFormValues

export function UpdateUserInformationVisibilityForm({
  user,
  onSuccess,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onSuccess: () => void
}) {
  const router = useRouter()
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserInformationVisibility),
    defaultValues: {
      informationVisibility: user.informationVisibility,
    },
  })
  const options = useMemo(
    () =>
      USER_INFORMATION_VISIBILITY_ORDERED_LIST.filter(x => {
        switch (x) {
          case UserInformationVisibility.CRYPTO_INFO_ONLY:
            return !user.hasEmbeddedWallet
          case UserInformationVisibility.ALL_INFO:
            return user.firstName || user.lastName
          default:
            return true
        }
      }),
    [user],
  )
  return (
    <Form {...form}>
      <div>
        <PageTitle className="mb-1" size="md">
          How you appear on Stand With Crypto
        </PageTitle>
        <PageSubTitle className="mb-7" size="md">
          Choose how you will appear on our public activity feed and leaderboard.
        </PageSubTitle>
        <form
          className="space-y-8"
          onSubmit={form.handleSubmit(async values => {
            const result = await triggerServerActionForForm(
              {
                form,
                formName: FORM_NAME,
                analyticsProps: {
                  'Information Visibility': values.informationVisibility,
                },
                payload: values,
              },
              payload => actionUpdateUserInformationVisibility(payload),
            )
            if (result.status === 'success') {
              router.refresh()
              toast.success('Profile updated', { duration: 5000 })
              onSuccess()
            }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
        >
          <FormField
            control={form.control}
            name="informationVisibility"
            render={({ field }) => (
              <>
                <RadioGroup
                  className="space-y-6"
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  {options.map(option => (
                    <RadioGroupItem className={'w-full'} key={option} value={option}>
                      <div
                        // if we apply these styles to the radio group item directly, radix injected input does weird things and causes the form to have scroll issues
                        className={cn(
                          'flex w-full items-center justify-between rounded-lg bg-purple-50 p-6',
                          option === field.value && 'ring-2 ring-purple-600 ring-offset-4',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar size={60} user={{ ...user, informationVisibility: option }} />
                          <p className="text-xl font-bold">
                            {getUserDisplayName({ ...user, informationVisibility: option })}
                          </p>
                        </div>
                        <RadioGroupIndicator className="block rounded-full bg-purple-600 p-1 text-white">
                          <Check className="h-4 w-4" />
                        </RadioGroupIndicator>
                      </div>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
                <FormErrorMessage />
              </>
            )}
          />
          <FormGeneralErrorMessage control={form.control} />
          <div className="flex justify-center gap-6">
            <Button
              className="w-full md:w-1/2"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </Form>
  )
}
