import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InternalLink, InternalLinkProps } from '@/components/ui/link'
import { StateShield } from '@/components/ui/stateShield'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface StateCardShieldProps {
  countryCode: SupportedCountryCodes
  stateCode: string
}

type StateCardButtonProps = InternalLinkProps

export function StateCard({ children }: React.PropsWithChildren) {
  return <Card className="w-[272px] items-center gap-8">{children}</Card>
}

function StateCardShield({ countryCode, stateCode }: StateCardShieldProps) {
  return <StateShield countryCode={countryCode} size={120} state={stateCode} />
}
StateCard.Shield = StateCardShield

function StateCardTitle({ children }: React.PropsWithChildren) {
  return <h4 className="text-xl font-bold">{children}</h4>
}
StateCard.Title = StateCardTitle

function StateCardButton(props: StateCardButtonProps) {
  return (
    <Button asChild className="font-semibold">
      <InternalLink {...props} />
    </Button>
  )
}
StateCard.Button = StateCardButton
