'use client'

import { useState } from 'react'

import { EventCard } from '@/components/app/pageEvents/components/event-card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const states = [
  { key: 'All', name: 'All' },
  { key: 'AL', name: 'Alabama' },
  { key: 'AK', name: 'Alaska' },
  { key: 'AZ', name: 'Arizona' },
  { key: 'AR', name: 'Arkansas' },
  { key: 'CA', name: 'California' },
  { key: 'CO', name: 'Colorado' },
  { key: 'CT', name: 'Connecticut' },
  { key: 'DE', name: 'Delaware' },
  { key: 'FL', name: 'Florida' },
  { key: 'GA', name: 'Georgia' },
  { key: 'HI', name: 'Hawaii' },
  { key: 'ID', name: 'Idaho' },
  { key: 'IL', name: 'Illinois' },
  { key: 'IN', name: 'Indiana' },
  { key: 'IA', name: 'Iowa' },
  { key: 'KS', name: 'Kansas' },
  { key: 'KY', name: 'Kentucky' },
  { key: 'LA', name: 'Louisiana' },
  { key: 'ME', name: 'Maine' },
  { key: 'MD', name: 'Maryland' },
  { key: 'MA', name: 'Massachusetts' },
  { key: 'MI', name: 'Michigan' },
  { key: 'MN', name: 'Minnesota' },
  { key: 'MS', name: 'Mississippi' },
  { key: 'MO', name: 'Missouri' },
  { key: 'MT', name: 'Montana' },
  { key: 'NE', name: 'Nebraska' },
  { key: 'NV', name: 'Nevada' },
  { key: 'NH', name: 'New Hampshire' },
  { key: 'NJ', name: 'New Jersey' },
  { key: 'NM', name: 'New Mexico' },
  { key: 'NY', name: 'New York' },
  { key: 'NC', name: 'North Carolina' },
  { key: 'ND', name: 'North Dakota' },
  { key: 'OH', name: 'Ohio' },
  { key: 'OK', name: 'Oklahoma' },
  { key: 'OR', name: 'Oregon' },
  { key: 'PA', name: 'Pennsylvania' },
  { key: 'RI', name: 'Rhode Island' },
  { key: 'SC', name: 'South Carolina' },
  { key: 'SD', name: 'South Dakota' },
  { key: 'TN', name: 'Tennessee' },
  { key: 'TX', name: 'Texas' },
  { key: 'UT', name: 'Utah' },
  { key: 'VT', name: 'Vermont' },
  { key: 'VA', name: 'Virginia' },
  { key: 'WA', name: 'Washington' },
  { key: 'WV', name: 'West Virginia' },
  { key: 'WI', name: 'Wisconsin' },
  { key: 'WY', name: 'Wyoming' },
]

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
          {states.map(state => (
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
