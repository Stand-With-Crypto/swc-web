import { ExternalLink } from '@/components/ui/link'

export function TurbovoteDisclaimer() {
  return (
    <div className="relative top-20 mx-auto max-w-3xl">
      <p className="text-center text-xs text-muted-foreground">
        Prepare To Vote information comes from{' '}
        <ExternalLink href="https://turbovote.org">TurboVote.org</ExternalLink>, a third-party
        website. It is always a good idea to verify your polling location directly with local
        officials before heading out to vote!
      </p>
    </div>
  )
}
