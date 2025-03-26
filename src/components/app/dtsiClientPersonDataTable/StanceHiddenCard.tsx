import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'
import { useState } from 'react'

export function StanceHiddenCard() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip onOpenChange={setIsTooltipOpen} open={isTooltipOpen}>
          <TooltipTrigger
            className="flex items-center gap-1"
            onClick={() => setIsTooltipOpen(true)}
            style={{ height: 35 }}
          >
            <p>Not Calculated</p>
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="bottom">
            <p className="text-sm font-normal tracking-normal">
              This content is hidden for legal or other purposes.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}
