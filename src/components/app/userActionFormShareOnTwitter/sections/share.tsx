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
      <UserActionFormLayout.Container
        className="h-auto
        items-center justify-center
      "
      >
        <UserActionFormLayout.Heading
          subtitle="Tweet #StandWithCrypto and help bring more advocates to the cause."
          title="Spread the word on X"
        />

        <UserActionTweetLink asChild>
          <Button
            className="w-full max-w-[450px]"
            onClick={() => goToSection(SECTIONS_NAMES.SUCCESS)}
            size="lg"
          >
            Tweet #StandWithCrypto
          </Button>
        </UserActionTweetLink>
      </UserActionFormLayout.Container>
    </UserActionFormLayout>
  )
}
