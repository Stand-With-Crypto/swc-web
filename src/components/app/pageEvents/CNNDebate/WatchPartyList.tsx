import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { cn } from '@/utils/web/cn'

import { WATCH_PARTIES } from './constants'
import WatchPartyImage from './image.png'

export function WatchPartyList() {
  return WATCH_PARTIES.map(party => (
    <a href={party.link} key={`${party.location}`} target="_blank">
      <div
        className={cn(
          'flex w-full flex-col items-center justify-between gap-6 rounded-3xl bg-secondary p-6 text-left hover:drop-shadow-lg sm:flex-row sm:gap-4 sm:px-6 sm:py-4',
        )}
        data-test-id={`cnn-debate-watch-party-${party.location.toLowerCase()}`}
      >
        <div className="sm:flex-4 flex flex-1 flex-col items-center gap-2 sm:flex-row">
          <div className="rounded-x flex h-[70px] w-[70px] flex-shrink-0 items-center justify-center overflow-hidden">
            <NextImage
              alt={`watch-party-${party.location}`}
              className="object-cover"
              height={70}
              src={WatchPartyImage}
              width={70}
            />
          </div>
          <div className="text-xl font-bold sm:text-base sm:leading-normal">{party.location}</div>
        </div>
        <Button className="w-full sm:w-auto">RSVP</Button>
      </div>
    </a>
  ))
}
