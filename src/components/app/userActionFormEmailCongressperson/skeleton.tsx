import { noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { getDefaultText } from '@/components/app/userActionFormEmailCongressperson/getDefaultText'
import { Button } from '@/components/ui/button'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'

export function UserActionFormEmailCongresspersonSkeleton({ locale }: { locale: SupportedLocale }) {
  const urls = getIntlUrls(locale)
  return (
    <form className="flex max-h-dvh flex-col">
      <LoadingOverlay />
      <ScrollArea>
        <div className="space-y-4 p-6 md:space-y-8 md:px-12">
          <PageTitle className="mb-3" size="sm">
            Email your congressperson
          </PageTitle>
          <PageSubTitle className="mb-7">
            Email your Congressperson and tell them to support crypto. Enter following information
            and we will generate a personalized email for you to send to your representative.
          </PageSubTitle>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormItemSkeleton>
              <label>Name</label>
              <Input placeholder="Your name" />
            </FormItemSkeleton>

            <FormItemSkeleton>
              <label>Email</label>
              <Input placeholder="Your email" />
            </FormItemSkeleton>
            <FormItemSkeleton>
              <label>Phone number</label>
              <Input placeholder="Your phone number" />
            </FormItemSkeleton>
            <FormItemSkeleton>
              <label>Address</label>
              <Input placeholder="Your full address" />
            </FormItemSkeleton>
          </div>
          <FormItemSkeleton>
            <Textarea defaultValue={getDefaultText()} placeholder="Your message..." rows={10} />
          </FormItemSkeleton>
          <div>
            <p className="text-xs text-fontcolor-muted">
              By submitting, I understand that Stand With Crypto and its vendors may collect and use
              my Personal Information. To learn more, visit the Stand With Crypto Alliance{' '}
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
        className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
      >
        <div className="w-full">
          <DTSICongresspersonAssociatedWithFormAddress
            currentDTSISlugValue={''}
            onChangeDTSISlug={noop}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto" size="lg" type="submit">
            Send
          </Button>
        </div>
      </div>
    </form>
  )
}
