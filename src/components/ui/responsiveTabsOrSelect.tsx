'use client'

import { useEffect, useState } from 'react'
import { TabsProps } from '@radix-ui/react-tabs'
import Cookies from 'js-cookie'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/utils/web/cn'

type TabOption = {
  value: string
  label: string
  content: React.ReactNode
}

type ResponsiveTabsOrSelectProps = TabsProps & {
  options: TabOption[]
  analytics: string
  forceDesktop?: boolean
  containerClassName?: string
  persistCurrentTab?: boolean
}

export function ResponsiveTabsOrSelect({
  defaultValue,
  options,
  analytics,
  forceDesktop,
  containerClassName,
  persistCurrentTab = false,
  ...props
}: ResponsiveTabsOrSelectProps) {
  const [currentTab, setCurrentTab] = useState(defaultValue)

  const handleValueChange = (value: string) => {
    setCurrentTab(value)

    if (persistCurrentTab) {
      persistCurrentTabInCookies(value)
    }
  }

  useEffect(() => {
    if (persistCurrentTab) {
      setCurrentTab(getCurrentTabFromCookies(defaultValue))
    }
  }, [defaultValue, persistCurrentTab])

  return (
    <Tabs analytics={analytics} onValueChange={handleValueChange} value={currentTab} {...props}>
      {/* Mobile: Select */}
      <div className={cn('sm:hidden', forceDesktop && 'hidden', containerClassName)}>
        <Select onValueChange={handleValueChange} value={currentTab} defaultValue={defaultValue}>
          <SelectTrigger
            className="mx-auto mb-10 min-h-14 w-full rounded-full bg-secondary text-base font-semibold"
            data-testid="responsive-tabs-or-select-trigger"
          >
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
      <div
        className={cn(
          'mb-8 hidden text-center sm:mb-4 sm:block',
          forceDesktop && 'block',
          containerClassName,
        )}
      >
        <TabsList className="mx-auto" data-testid="responsive-tabs-or-select-tabs-list">
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

const CURRENT_RACES_TAB = 'CURRENT_RACES_TAB'

function persistCurrentTabInCookies(currentTab: string) {
  if (typeof window !== 'undefined') {
    return Cookies.set(CURRENT_RACES_TAB, currentTab)
  }
}

function getCurrentTabFromCookies(fallback?: string) {
  if (typeof window !== 'undefined') {
    return Cookies.get(CURRENT_RACES_TAB) ?? fallback
  }

  return fallback
}
