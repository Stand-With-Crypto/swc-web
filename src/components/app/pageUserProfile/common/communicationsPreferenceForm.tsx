import { ComponentProps } from 'react'
import { Info, Loader2 } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/utils/web/cn'

interface CommunicationsPreferenceFormProps {
  children: React.ReactNode
}

export function CommunicationsPreferenceForm({ children }: CommunicationsPreferenceFormProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-4">{children}</div>
    </TooltipProvider>
  )
}

CommunicationsPreferenceForm.FormItem = function CommunicationsPreferenceFormFormItem({
  children,
  disclaimerText,
}: {
  children: React.ReactNode
  disclaimerText: string
}) {
  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
      {children}
      <p className="text-sm text-muted-foreground">{disclaimerText}</p>
    </div>
  )
}

interface CheckboxFieldProps extends ComponentProps<typeof Checkbox> {
  label: string
  isLoading: boolean
  helpText?: string
}

function CheckboxField({ label, helpText, isLoading, children, ...props }: CheckboxFieldProps) {
  return (
    <div className="relative flex min-w-[90px] items-center gap-2 pr-6">
      <label
        className={cn('flex cursor-pointer items-center gap-2', {
          'cursor-not-allowed text-muted-foreground': props.disabled,
        })}
      >
        {children || <Checkbox {...props} />}
        <p>{label}</p>
      </label>

      {helpText ? (
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>{helpText}</TooltipContent>
        </Tooltip>
      ) : null}

      {isLoading ? <Loader2 className="absolute right-0 h-4 w-4 animate-spin" /> : null}
    </div>
  )
}

CommunicationsPreferenceForm.CheckboxField = CheckboxField
