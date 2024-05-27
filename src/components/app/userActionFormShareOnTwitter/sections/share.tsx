import { UserActionFormLayout } from '@/components/app/userActionFormCommon'
import { SECTIONS_NAMES } from '@/components/app/userActionFormShareOnTwitter/constants'
import { Button } from '@/components/ui/button'
import { UserActionTweetLink } from '@/components/ui/userActionTweetLink'
import { UseSectionsReturn } from '@/hooks/useSections'

interface ShareOnXProps extends UseSectionsReturn<SECTIONS_NAMES> {}

export function ShareOnX(props: ShareOnXProps) {
  const { goToSection } = props

  return (
    <UserActionFormLayout>
      <UserActionFormLayout.Container>
        <UserActionFormLayout.Heading
          subtitle="Bring more people to the movement."
          title="Share on X"
        />

        <UserActionTweetLink asChild>
          <Button onClick={() => goToSection(SECTIONS_NAMES.SUCCESS)}>Share on X</Button>
        </UserActionTweetLink>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
