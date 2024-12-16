import { Button } from '@/components/ui/button'
import { dialogContentPaddingStyles } from '@/components/ui/dialog/styles'
import { FormItemSkeleton } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ExternalLink, InternalLink } from '@/components/ui/link'
import { LoadingOverlay } from '@/components/ui/loadingOverlay'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/utils/web/cn'

export function UserActionFormEmailDebateSkeleton() {
  return (
    <form className="flex max-h-dvh w-full flex-col">
      <LoadingOverlay />
      <ScrollArea>
        <div className={cn(dialogContentPaddingStyles, 'space-y-4 md:space-y-8')}>
          <PageTitle className="mb-3" size="md">
            Ask ABC to include crypto at the Debate
          </PageTitle>
          <PageSubTitle className="mb-7">
            Crypto deserves to be a topic at the Presidential Debate. Send a note to ABC and ask
            them to make sure that the 52 million crypto owners in America are represented on the
            debate stage.
          </PageSubTitle>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItemSkeleton>
                <label>First name</label>
                <Input disabled placeholder="First name" />
              </FormItemSkeleton>
              <FormItemSkeleton>
                <label>Last name</label>
                <Input disabled placeholder="Last name" />
              </FormItemSkeleton>
              <FormItemSkeleton>
                <label>Email</label>
                <Input disabled placeholder="Your email" />
              </FormItemSkeleton>
              <FormItemSkeleton>
                <label>Address</label>
                <Input disabled placeholder="Your address" />
              </FormItemSkeleton>
            </div>

            <div className="relative">
              <FormItemSkeleton>
                <Textarea
                  disabled
                  rows={16}
                  value={`I am one of the 52 million Americans who own cryptocurrency. Crypto can drive American innovation and global leadership by fostering strong consumer protection, creating high-skilled jobs, and strengthening our national security. Unfortunately, bad policy could push this technology overseas, and cost the U.S. nearly 4 million jobs.

Crypto owners are uniquely bipartisan - 18% Republicans, 22% Democrats, and 22% Independents hold crypto. Crypto provides access to the banking system to disenfranchised communities and communities of color and can help bolster an economy that works for everyone.

On behalf of myself and all American crypto owners, I urge you to ask the candidates their position on cryptocurrency and its place in the American economy. Bipartisan crypto legislation has already passed the House of Representatives, and more and more elected officials are coming out in support of crypto.

Giving the major Presidential candidates a chance to weigh in on this transformational technology in the first debate would go a long way towards educating the electorate and helping American crypto owners cast an informed ballot.

Thank you for your consideration.`}
                />
              </FormItemSkeleton>
            </div>
          </div>
        </div>
        <div className="pb-4 pl-4">
          <p className="text-xs text-fontcolor-muted">
            By submitting, I understand that Stand With Crypto and its vendors may collect and use
            my personal information subject to the{' '}
            <InternalLink href="#">SWC Privacy Policy</InternalLink> and the{' '}
            <ExternalLink href="#">Quorum Privacy Policy</ExternalLink>.
          </p>
        </div>
      </ScrollArea>
      <div
        className="z-10 flex flex-1 flex-col items-center justify-center gap-4 border border-t p-6 sm:flex-row md:px-12"
        style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
      >
        <Button className="w-full sm:max-w-md" disabled size="lg" type="submit">
          Send
        </Button>
      </div>
    </form>
  )
}
