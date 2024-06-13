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

export function UserActionFormEmailCNNSkeleton({ locale }: { locale: SupportedLocale }) {
  const urls = getIntlUrls(locale)
  return (
    <form className="flex max-h-dvh flex-col">
      <LoadingOverlay />
      <ScrollArea>
        <div className="space-y-4 p-6 md:space-y-8 md:px-12">
          <PageTitle className="mb-3" size="sm">
            Ask CNN to feature crypto at the Presidential Debate
          </PageTitle>
          <PageSubTitle className="mb-7">
            Crypto deserves to be a presidential debate topic. Send an email to CNN and ask them to
            include questions around crypto in the debate.
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

            <div className="relative">
              <FormItemSkeleton>
                <Textarea
                  defaultValue={getDefaultText()}
                  placeholder="I stand for crypto and I urge you to support crypto legislation that will establish clear regulations for the betterment of consumers, investors, developers, and beyond.
Over the past 15 years, crypto has emerged onto the world stage, and the power of crypto is being realized through an increasing number of use cases, such as cross border payments and remittances, enablement of humanitarian relief efforts, and access to funds in otherwise inaccessible situations. The potential of crypto is endless: it creates ways for creators and artists to directly receive payments and royalties, it provides pathways for aid to oppressed groups, it gives revolutionaries in totalitarian states access to uncensorable financial services, and so much more. Nonetheless, it's equally important to ensure that this potential grows in a responsible manner and adheres to regulatory standards."
                  rows={16}
                />
              </FormItemSkeleton>
            </div>
          </div>
        </div>
      </ScrollArea>
      <div
        className="z-10 flex flex-1 flex-col items-center justify-between gap-4 border border-t p-6 sm:flex-row md:px-12"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
      >
        <div>
          <p className="text-xs text-fontcolor-muted">
            By submitting, I understand that Stand With Crypto and its vendors may collect and use
            my personal information subject to the{' '}
            <InternalLink href={urls.privacyPolicy()}>SWC Privacy Policy</InternalLink> and the{' '}
            <ExternalLink href={'https://www.quorum.us/privacy-policy/'}>
              Quorum Privacy Policy
            </ExternalLink>
            .
          </p>
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
