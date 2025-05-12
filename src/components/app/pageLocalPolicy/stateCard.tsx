import { StateCardProps } from '@/components/app/pageLocalPolicy/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { InternalLink } from '@/components/ui/link'
import { StateShield } from '@/components/ui/stateShield'

export function StateCard({ countryCode, state, urls }: StateCardProps) {
  return (
    <Card className="w-[272px] items-center gap-8">
      <StateShield countryCode={countryCode} size={120} state={state.code} />
      <h4 className="text-xl font-bold">{state.name}</h4>
      <Button asChild className="font-semibold">
        <InternalLink href={urls.localPolicy(state.code)}>View local policy</InternalLink>
      </Button>
    </Card>
  )
}
