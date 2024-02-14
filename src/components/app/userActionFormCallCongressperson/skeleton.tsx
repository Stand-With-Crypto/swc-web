import { IntroStaticContent } from '@/components/app/userActionFormCallCongressperson/sections/intro'
import { Button } from '@/components/ui/button'

export function UserActionFormCallCongresspersonSkeleton() {
  return (
    <IntroStaticContent>
      <Button disabled>Loading...</Button>
    </IntroStaticContent>
  )
}
