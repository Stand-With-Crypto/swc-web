'use client'

import React from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FAQItemCollapsibleProps {
  title: string
}

export function FAQItemCollapsible({
  title,
  children,
}: React.PropsWithChildren<FAQItemCollapsibleProps>) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <Collapsible open={isExpanded} onOpenChange={() => setIsExpanded(prev => !prev)}>
      <CollapsibleTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          className="flex h-auto w-full items-center justify-between px-4 py-6 text-start font-bold"
        >
          {title}

          {isExpanded ? <Minus /> : <Plus />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="AnimateCollapsibleContent">{children}</CollapsibleContent>
    </Collapsible>
  )
}
