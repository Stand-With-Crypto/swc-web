import { noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import {
  DIALOG_SUBTITLE,
  DIALOG_TITLE,
  EMAIL_FLOW_POLITICIANS_CATEGORY,
  getEmailBodyText,
} from '@/components/app/userActionFormEmailCongressperson/campaignMetadata'
import { Button } from '@/components/ui/button'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { YourPoliticianCategory } from '@/utils/shared/yourPoliticianCategory'

export function UserActionFormEmailCongresspersonSkeleton({
  countryCode,
  politicianCategory = EMAIL_FLOW_POLITICIANS_CATEGORY,
}: {
  countryCode: SupportedCountryCodes
  politicianCategory?: YourPoliticianCategory
}) {
  const urls = getIntlUrls(countryCode)
  return (
    <form className="flex max-h-dvh flex-col">
      <LoadingOverlay />
      <ScrollArea>
        <div className="space-y-4 p-6 md:space-y-8 md:px-12">
          <PageTitle className="mb-3" size="sm">
            {DIALOG_TITLE}
          </PageTitle>
          <PageSubTitle className="mb-7">{DIALOG_SUBTITLE}</PageSubTitle>
          <div className="space-y-4">
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
            <div className="w-full">
              <DTSICongresspersonAssociatedWithFormAddress
                countryCode={countryCode}
                dtsiPeopleFromAddressResponse={{} as ReturnType<typeof useGetDTSIPeopleFromAddress>}
                onChangeAddress={noop}
                politicianCategory={politicianCategory}
              />
            </div>
            <div className="relative">
              <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-background/90">
                <p className="text-bold max-w-md text-center">
                  Enter your address to generate a personalized message.
                </p>
              </div>
              <FormItemSkeleton>
                <Textarea
                  autoComplete="off"
                  autoCorrect="off"
                  defaultValue={getEmailBodyText()}
                  placeholder="Your message..."
                  rows={16}
                  spellCheck={false}
                />
              </FormItemSkeleton>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="py-6 md:px-12">
        <p className="text-xs text-fontcolor-muted">
          By submitting, I understand that Stand With Crypto and its vendors may collect and use my
          personal information subject to the{' '}
          <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink> and the{' '}
          <ExternalLink href={'https://www.quorum.us/privacy-policy/'}>
            Quorum Privacy Policy
          </ExternalLink>
          .
        </p>
      </div>

      <div
        className="z-10 flex flex-1 flex-col items-center justify-center gap-4 border border-t p-6 sm:flex-row md:px-12"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
      >
        <Button className="w-full sm:max-w-md" size="lg" type="submit">
          Send
        </Button>
      </div>
    </form>
  )
}
