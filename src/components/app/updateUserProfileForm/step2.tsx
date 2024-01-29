'use client'
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
import { USER_INFORMATION_VISIBILITY_ORDERED_LIST, getUserDisplayName } from '@/utils/web/userUtils'
import { zodUpdateUserInformationVisibility } from '@/validation/forms/zodUpdateUserInformationVisibility'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserEmailAddressSource, UserInformationVisibility } from '@prisma/client'
import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const FORM_NAME = 'User Information Visibility'
type FormValues = z.infer<typeof zodUpdateUserInformationVisibility> & GenericErrorFormValues

export function UpdateUserInformationVisibilityForm({
  user,
  onSuccess,
}: {
  user: SensitiveDataClientUserWithENSData & { address: ClientAddress | null }
  onCancel: () => void
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
            return (
              user.primaryUserEmailAddress?.source !== UserEmailAddressSource.THIRDWEB_EMBEDDED_AUTH
            )
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
        <PageTitle size="sm" className="mb-1">
          How you appear on Stand With Crypto
        </PageTitle>
        <PageSubTitle size="md" className="mb-7">
          Choose how you will appear on our public activity feed and leaderboard.
        </PageSubTitle>
        <form
          onSubmit={form.handleSubmit(async values => {
            const result = await triggerServerActionForForm(
              {
                form,
                formName: FORM_NAME,
                analyticsProps: {
                  'Information Visibility': values.informationVisibility,
                },
              },
              () => actionUpdateUserInformationVisibility(values),
            )
            if (result.status === 'success') {
              router.refresh()
              toast.success('Profile updated', { duration: 5000 })
              onSuccess()
            }
          }, trackFormSubmissionSyncErrors(FORM_NAME))}
          className="space-y-8"
        >
          <FormField
            control={form.control}
            name="informationVisibility"
            render={({ field }) => (
              <>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-6"
                >
                  {options.map(option => (
                    <RadioGroupItem
                      key={option}
                      value={option}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg bg-blue-50 p-6',
                        option === field.value && 'ring-2 ring-blue-600 ring-offset-4',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={{ ...user, informationVisibility: option }} size={60} />
                        <p className="text-xl font-bold">
                          {getUserDisplayName({ ...user, informationVisibility: option })}
                        </p>
                      </div>
                      <RadioGroupIndicator className="block rounded-full bg-blue-600 p-1 text-white">
                        <Check className="h-4 w-4" />
                      </RadioGroupIndicator>
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
                <FormErrorMessage />
              </>
            )}
          />
          <FormGeneralErrorMessage control={form.control} />
          <div className="space-y-4">
            <Button
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full"
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </Form>
  )
}
