'use client'
import { actionCreateUserActionEmailCongressperson } from '@/actions/actionCreateUserActionEmailCongressperson'
import { apiResponseForUserFullProfileInfo } from '@/app/api/identified-user/full-profile-info/route'
import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { PlacesAutocomplete } from '@/components/ui/googlePlacesSelect'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useLocale } from '@/hooks/useLocale'
import { useTrackSubmissionErrors } from '@/hooks/useTrackSubmissionErrors'
import { getIntlUrls } from '@/utils/shared/urls'
import { UserActionEmailCampaignName } from '@/utils/shared/userActionCampaigns'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'
import { formatGooglePlacesResultToAddress } from '@/utils/web/formatGooglePlacesResultToAddress'
import { catchUnexpectedServerErrorAndTriggerToast } from '@/utils/web/toastUtils'
import { zodUserActionFormEmailCongresspersonFields } from '@/validation/forms/zodUserActionFormEmailCongressperson'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { getDetails } from 'use-places-autocomplete'
import { z } from 'zod'

const FORM_NAME = 'User Action Form Email Congressperson'
type FormValues = z.infer<typeof zodUserActionFormEmailCongresspersonFields> &
  GenericErrorFormValues

const DEFAULT_MESSAGE = `The House Financial Services Committee and the House Agriculture Committee in the U.S. House of Representatives passed historic, bipartisan legislation in July. I am asking you to support the bill when it comes to the floor for a full House vote.

  The Financial Innovation and Technology for the 21st Century Act ("FIT21") addresses a pressing need for regulatory clarity in the United States for crypto. A vote for this bill is a vote to protect customers, promote job opportunities, and bolster national security.
  
  As your constituent, I am asking you to vote for FIT21 to safeguard consumers and promote responsible innovation. Thank you.`

const getDefaultValues = ({
  user,
  dtsiSlug,
}: {
  user: Awaited<ReturnType<typeof apiResponseForUserFullProfileInfo>>['user']
  dtsiSlug: string | undefined
}) => {
  if (user) {
    return {
      campaignName: UserActionEmailCampaignName.DEFAULT,
      fullName: user.fullName,
      email: user.primaryUserEmailAddress?.address || '',
      phoneNumber: user.phoneNumber,
      message: DEFAULT_MESSAGE,
      address: user.address
        ? {
            description: user.address.formattedDescription,
            place_id: user.address.googlePlaceId,
          }
        : undefined,
    }
  }
  return {
    campaignName: UserActionEmailCampaignName.DEFAULT,
    fullName: '',
    email: '',
    phoneNumber: '',
    message: DEFAULT_MESSAGE,
    address: undefined,
    dtsiSlug,
  }
}

export function UserActionFormEmailCongressperson({
  onCancel,
  onSuccess,
  user,
}: {
  user: Awaited<ReturnType<typeof apiResponseForUserFullProfileInfo>>['user']
  onCancel: () => void
  onSuccess: () => void
}) {
  const router = useRouter()
  const locale = useLocale()
  const urls = getIntlUrls(locale)
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUserActionFormEmailCongresspersonFields),
    defaultValues: getDefaultValues({ user, dtsiSlug: undefined }),
  })
  useTrackSubmissionErrors(form.formState, FORM_NAME)
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async values => {
          const address = await getDetails({
            placeId: values.address.place_id,
            fields: ['address_components'],
          })
            .then(_details => {
              const address = values.address!
              const details = _details as Required<
                Pick<google.maps.places.PlaceResult, 'address_components'>
              >
              return formatGooglePlacesResultToAddress({
                ...details,
                formattedDescription: address.description,
                placeId: address.place_id,
              })
            })
            .catch(e => {
              Sentry.captureException(e)
              catchUnexpectedServerErrorAndTriggerToast(e)
              return null
            })
          if (!address) {
            return
          }
          const result = await triggerServerActionForForm({ form, formName: FORM_NAME }, () =>
            actionCreateUserActionEmailCongressperson({ ...values, address }),
          )
          if (result.status === 'success') {
            router.refresh()
            onSuccess()
          }
        })}
        className="flex max-h-screen flex-col"
      >
        <ScrollArea>
          <div className="space-y-4 p-6 md:space-y-8 md:px-12">
            <PageTitle size="sm" className="mb-3">
              Email your congressperson
            </PageTitle>
            <PageSubTitle className="mb-7">
              Email your Congressperson and tell them to support crypto. Enter following information
              and we will generate a personalized email for you to send to your representative.
            </PageSubTitle>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
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
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field: { ref, ...field } }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <PlacesAutocomplete
                        {...field}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Your full address"
                      />
                    </FormControl>
                    <FormErrorMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea rows={10} placeholder="Your message..." {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormGeneralErrorMessage control={form.control} />
            <div>
              {/* TODO where does give feedback link */}
              {/* <p className="mb-2 text-xs text-fontcolor-muted">
              Please ensure content accurately represents the facts and your views prior to
              submitting this email. You are responsible for your submission. This AI generated text
              may produce inaccurate information about people, places, or facts. Give feedback.
            </p> */}
              <p className="text-xs text-fontcolor-muted">
                By submitting, I understand that Stand With Crypto and its vendors may collect and
                use my Personal Information. To learn more, visit the Stand With Crypto Alliance{' '}
                <InternalLink href={urls.privacyPolicy()}>Privacy Policy</InternalLink> and{' '}
                <ExternalLink href={'https://www.quorum.us/static/Privacy-Policy.pdf'}>
                  Quorum Privacy Policy
                </ExternalLink>
                .
              </p>
            </div>
          </div>
        </ScrollArea>
        <div
          style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
          className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
        >
          <FormField
            control={form.control}
            name="address"
            render={addressProps => (
              <FormField
                control={form.control}
                name="dtsiSlug"
                render={dtsiSlugProps => (
                  <div className="w-full">
                    <DTSICongresspersonAssociatedWithFormAddress
                      onChangeDTSISlug={dtsiSlugProps.field.onChange}
                      currentDTSISlugValue={dtsiSlugProps.field.value}
                      address={addressProps.field.value}
                    />
                    <FormErrorMessage />
                  </div>
                )}
              />
            )}
          />
          <div className="w-full sm:w-auto">
            <Button
              className="w-full sm:w-auto"
              size="lg"
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Send
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
