'use client'

import { useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type TabOption = {
  value: string
  label: string
  content: React.ReactNode
}

type Props = {
  defaultValue: string
  options: TabOption[]
  analytics: string
}

export function ResponsiveTabsOrSelect({ defaultValue, options, analytics }: Props) {
  const [value, setValue] = useState(defaultValue)

  return (
    <Tabs analytics={analytics} onValueChange={setValue} value={value}>
      {/* Mobile: Select */}
      <div className="md:hidden">
        <Select onValueChange={setValue} value={value}>
          <SelectTrigger className="mx-auto mb-10 min-h-14 w-full rounded-full bg-secondary text-base font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl font-bold">
            <SelectItem className="pl-4 text-muted-foreground opacity-100" disabled value={'first'}>
              Select View
            </SelectItem>
            {options.map(option => (
              <SelectItem className="py-4" key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: TabsList */}
      <div className="mb-8 hidden text-center md:mb-4 md:block">
        <TabsList className="mx-auto">
          {options.map(option => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {/* Content (shared between mobile and desktop) */}
      <div className="space-y-8">
        {options.map(option => (
          <TabsContent key={option.value} value={option.value}>
            {option.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}
