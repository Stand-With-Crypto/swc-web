import * as React from 'react'

import { cn } from '@/utils/web/cn'
import { Input, InputProps } from '@/components/ui/input'

const InputWithIcon = React.forwardRef<HTMLInputElement, InputProps & { icon: React.ReactNode }>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-2">{icon}</div>
        <Input className={cn('pl-7', className)} ref={ref} {...props} />
      </div>
    )
  },
)
InputWithIcon.displayName = 'Input'

export { InputWithIcon }
