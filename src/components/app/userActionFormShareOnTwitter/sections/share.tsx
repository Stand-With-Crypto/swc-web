import { Check } from 'lucide-react'

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
      <UserActionFormLayout.Container className="h-auto items-center justify-between">
        <UserActionFormLayout.Heading
          subtitle="Tweet #StandWithCrypto and help bring more advocates to the cause."
          title="Spread the word on X"
        />

        <div>
          <h2 className="mb-1 font-semibold">Your support is crucial!</h2>
          <p className="mb-4">
            By tweeting #StandWithCrypto, you're helping us raise awareness and gather more
            advocates to support our cause:
          </p>

          <ul className="space-y-2">
            {[
              'Help influence policymakers and decision-makers',
              'Stay informed about the latest updates and initiatives',
              'Join a community of like-minded individuals',
            ].map(info => (
              <li className="flex items-center gap-4" key={info}>
                <Check size={20} />
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

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
