import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { useFieldArray, useFormContext, UseFormReturn, useWatch } from 'react-hook-form'
import { noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON } from '@/components/app/userActionFormEmailCongressperson/common/constants'
import { GetTextProps } from '@/components/app/userActionFormEmailCongressperson/common/emailBodyUtils'
import { EmailActionFormValues } from '@/components/app/userActionFormEmailCongressperson/common/types'
import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors } from '@/utils/web/formUtils'

export function EmailCongressperson({ children }: { children: ReactNode }) {
  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>{children}</UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}

interface EmailFormProps {
  children: ReactNode
  form: UseFormReturn<EmailActionFormValues>
  onSubmit: (data: EmailActionFormValues) => Promise<void>
}
EmailCongressperson.Form = function EmailForm({ children, form, onSubmit }: EmailFormProps) {
  const isDesktop = useIsDesktop()
  const { setFocus } = form

  useEffect(() => {
    if (isDesktop) {
      setFocus('firstName')
    }
  }, [isDesktop, setFocus])

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col"
        id={ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON}
        onSubmit={form.handleSubmit(
          onSubmit,
          trackFormSubmissionSyncErrors(ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON),
        )}
      >
        <ScrollArea className="overflow-auto">
          <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>{children}</div>
        </ScrollArea>
      </form>

      <EmailCongressperson.FormSubmitButton />
    </Form>
  )
}

EmailCongressperson.Heading = function Heading({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="space-y-4 md:space-y-8">
      <PageTitle size="sm">{title}</PageTitle>
      <PageSubTitle>{subtitle}</PageSubTitle>
    </div>
  )
}

EmailCongressperson.PersonalInformationFields = function PersonalInformation() {
  const { control } = useFormContext<EmailActionFormValues>()

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <FormField
        control={control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>First name</FormLabel>
            <FormControl>
              <Input placeholder="Your first name" {...field} />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Last name</FormLabel>
            <FormControl>
              <Input placeholder="Your last name" {...field} />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="emailAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="Your email" {...field} />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
              <GooglePlacesSelect
                {...field}
                onChange={field.onChange}
                placeholder="Your full address"
                shouldLimitUSAddresses
                value={field.value}
              />
            </FormControl>
            <FormErrorMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

EmailCongressperson.Representatives = function Representative({
  countryCode,
  categoryDisplayName,
  dtsiPeopleFromAddressResponse,
}: {
  countryCode: SupportedCountryCodes
  categoryDisplayName: string
  dtsiPeopleFromAddressResponse: ReturnType<typeof useGetDTSIPeopleFromAddress>
}) {
  const { control, setValue, getValues } = useFormContext<EmailActionFormValues>()

  const { replace, remove } = useFieldArray({
    control,
    name: 'dtsiPeople',
  })

  const dtsiPeople = useMemo(() => {
    return dtsiPeopleFromAddressResponse?.data && 'dtsiPeople' in dtsiPeopleFromAddressResponse.data
      ? dtsiPeopleFromAddressResponse.data.dtsiPeople
      : []
  }, [dtsiPeopleFromAddressResponse?.data])

  useEffect(() => {
    if (dtsiPeople.length === 0) {
      setValue('dtsiSlugs', [])
      remove()
      return
    }

    const currentSlugs = getValues('dtsiSlugs') || []
    const newSlugs = dtsiPeople.map(person => person.slug)

    const slugsAreEqual =
      currentSlugs.length === newSlugs.length &&
      newSlugs.every((slug, index) => slug === currentSlugs[index])
    if (slugsAreEqual) return

    replace(dtsiPeople)
    setValue('dtsiSlugs', newSlugs)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when dtsiPeople changes
  }, [dtsiPeople])

  return (
    <FormField
      control={control}
      name="address"
      render={addressProps => (
        <div className="w-full">
          <DTSICongresspersonAssociatedWithFormAddress
            address={addressProps.field.value}
            categoryDisplayName={categoryDisplayName}
            countryCode={countryCode}
            dtsiPeopleFromAddressResponse={dtsiPeopleFromAddressResponse}
            onChangeAddress={noop}
          />
        </div>
      )}
    />
  )
}

interface MessageProps {
  getEmailBodyText: (props: GetTextProps & { address?: string }) => string
}
EmailCongressperson.Message = function Message({ getEmailBodyText }: MessageProps) {
  const hasModifiedMessage = useRef(false)

  const { control, setValue } = useFormContext<EmailActionFormValues>()

  const dtsiSlugs = useWatch({
    control: control,
    name: 'dtsiSlugs',
  })

  const addressField = useWatch({
    control: control,
    name: 'address',
  })

  const firstName = useWatch({
    control: control,
    name: 'firstName',
  })
  const lastName = useWatch({
    control: control,
    name: 'lastName',
  })
  const dtsiPeople = useWatch({
    control: control,
    name: 'dtsiPeople',
  })
  const dtsiLastName = dtsiPeople?.[0]?.lastName

  useEffect(() => {
    if (hasModifiedMessage.current) return

    setValue(
      'contactMessage',
      getEmailBodyText({
        firstName,
        lastName,
        address: addressField?.description,
        dtsiLastName,
      }),
    )
  }, [firstName, lastName, addressField, setValue, getEmailBodyText, dtsiLastName])

  return (
    <FormField
      control={control}
      name="contactMessage"
      render={({ field }) => (
        <FormItem>
          <div className="relative">
            {!dtsiSlugs.length && (
              <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-background/90">
                <p className="text-bold max-w-md text-center">
                  Enter your address to generate a personalized message.
                </p>
              </div>
            )}
            <FormControl>
              <Textarea
                autoComplete="off"
                autoCorrect="off"
                placeholder=""
                rows={16}
                spellCheck={false}
                {...field}
                onChange={e => {
                  hasModifiedMessage.current = true
                  field.onChange(e)
                }}
              />
            </FormControl>
          </div>
          <FormErrorMessage />
        </FormItem>
      )}
    />
  )
}

EmailCongressperson.Disclaimer = function Disclaimer({
  countryCode,
}: {
  countryCode: SupportedCountryCodes
}) {
  const urls = getIntlUrls(countryCode)

  return (
    <div>
      <p className="text-xs text-fontcolor-muted">
        By submitting, I understand that Stand With Crypto and its vendors may collect and use my
        personal information subject to the{' '}
        <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink> .
      </p>
    </div>
  )
}

EmailCongressperson.FormSubmitButton = function FormSubmitButton() {
  const { formState } = useFormContext<EmailActionFormValues>()

  return (
    <div
      className="z-10 mt-auto flex flex-col items-center justify-center border border-t p-6 sm:flex-row md:px-12"
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
    >
      <Button
        className="w-full sm:max-w-md"
        disabled={formState.isSubmitting}
        form={ANALYTICS_NAME_USER_ACTION_FORM_EMAIL_CONGRESSPERSON}
        size="lg"
        type="submit"
      >
        Send
      </Button>
    </div>
  )
}
