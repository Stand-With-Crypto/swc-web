'use client'

import { useState } from 'react'

import { EventCard } from '@/components/app/pageEvents/components/event-card'
import { stateSelectOptions } from '@/components/app/pageEvents/constants'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function UpcomingEvents() {
  const [selectedState, setSelectedState] = useState('All')

  return (
    <section className="flex w-full flex-col items-center gap-4 lg:gap-6">
      <h4 className="text-bold font-sans text-xl text-foreground lg:text-[2rem]">
        All upcoming events
      </h4>

      <Select onValueChange={state => setSelectedState(state)} value={selectedState}>
        <SelectTrigger className="max-w-[345px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {stateSelectOptions.map(state => (
            <SelectItem key={state.key} value={state.key}>
              <strong>State: </strong>
              {state.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="my-2 flex w-full flex-col items-center gap-4">
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
        <EventCard />
      </div>

      <Button size="lg" variant="secondary">
        View more
      </Button>
    </section>
  )
}
