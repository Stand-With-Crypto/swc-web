import { capitalize, noop } from 'lodash-es'

import { DTSICongresspersonAssociatedWithFormAddress } from '@/components/app/dtsiCongresspersonAssociatedWithFormAddress'
import { EMAIL_FLOW_POLITICIANS_CATEGORY } from '@/components/app/userActionFormEmailCongressperson/constants'
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
import { useGetDTSIPeopleFromAddress } from '@/hooks/useGetDTSIPeopleFromAddress'
import { SupportedLocale } from '@/intl/locales'
import { getIntlUrls } from '@/utils/shared/urls'
import {
  getYourPoliticianCategoryShortDisplayName,
  YourPoliticianCategory,
} from '@/utils/shared/yourPoliticianCategory'

export function UserActionFormEmailCongresspersonSkeleton({
  locale,
  politicianCategory = EMAIL_FLOW_POLITICIANS_CATEGORY,
}: {
  locale: SupportedLocale
  politicianCategory?: YourPoliticianCategory
}) {
  const urls = getIntlUrls(locale)
  return (
    <form className="flex max-h-dvh flex-col">
      <LoadingOverlay />
      <ScrollArea>
        <div className="space-y-4 p-6 md:space-y-8 md:px-12">
          <PageTitle className="mb-3" size="sm">
            Email your {capitalize(getYourPoliticianCategoryShortDisplayName(politicianCategory))}
          </PageTitle>
          <PageSubTitle className="mb-7">
            With FIT21 passed by the House, take a moment to reach out to your Rep and say thanks
            for voting Yes or ask them to reconsider the importance of crypto if they voted against.
          </PageSubTitle>
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
                <Textarea defaultValue={getDefaultText()} placeholder="Your message..." rows={16} />
              </FormItemSkeleton>
            </div>
          </div>
        </div>
      </ScrollArea>
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
