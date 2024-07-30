import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { PageTitle } from '@/components/ui/pageTitleText'

export function SWCMembershipDialog({ children }: { children: React.ReactNode }) {
  return (
    <Dialog analytics={'SWC Membership Explainer'}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent a11yTitle="Stand With Crypto membership" className="spacy-y-7 w-full max-w-md">
        <PageTitle className="mb-1 text-left" size="sm" withoutBalancer>
          What does it mean to be a Stand With Crypto Alliance member?
        </PageTitle>
        <div className="text-fontcolor-muted">
          <p className="mb-2">
            Becoming a member of Stand With Crypto is free. As a member you will:
          </p>
          <ul className="ml-4 list-disc">
            <li>
              Receive in-depth member-exclusive analyses on upcoming elections that impact the
              future of crypto in America
            </li>
            <li>
              Make your voice heard and ensure Stand With Crypto will advocate for issues you care
              about
            </li>
            <li>
              Join a group of like-minded individuals to form the largest pro-crypto organization in
              the US
            </li>
          </ul>
        </div>
        <DialogClose asChild>
          <Button className="w-full" size="lg">
            OK
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
