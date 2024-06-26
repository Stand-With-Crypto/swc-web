import { Button } from '@/components/ui/button'

import { HOST_WATCH_PARTY_URL } from './constants'
import { WatchPartyList } from './WatchPartyList'

export function CNNDebateEventPage() {
  return (
    <div className="container flex flex-col gap-10 px-6 pt-10 sm:gap-20 sm:pt-20">
      <section className="flex flex-col items-center gap-10 sm:gap-12">
        <div className="flex flex-col gap-4 sm:gap-6">
          <h3 className="text-bold text-center font-sans text-xl text-foreground sm:text-[32px] sm:leading-normal">
            Presidential Debate watch parties
          </h3>
          <h4 className="text-center font-mono text-base font-normal leading-normal text-muted-foreground sm:text-xl sm:leading-7">
            The first Presidential Debate of the general election is coming up on Thursday, June
            27th at 9 PM ET. We need to prove to politicians that crypto voters can change outcomes
            this election. Crypto advocates are hosting watch parties across the country to make
            sure our Presidential candidates stand with crypto. Find one to attend, or host one of
            your own.
          </h4>
        </div>
        <Button asChild className="w-full sm:w-fit">
          <a href={`${HOST_WATCH_PARTY_URL}`} target="_blank">
            Host a watch party
          </a>
        </Button>
      </section>
      <section className="flex flex-col gap-6">
        <h4 className="text-center font-sans text-base font-bold leading-normal text-foreground sm:text-xl sm:leading-7">
          Upcoming watch parties
        </h4>
        <div className="flex flex-col gap-4">
          <WatchPartyList />
        </div>
      </section>
    </div>
  )
}
