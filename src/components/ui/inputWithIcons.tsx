import * as React from 'react'

import { cn } from '@/utils/web/cn'
import { Input, InputProps } from '@/components/ui/input'

const InputWithIcons = React.forwardRef<
  HTMLInputElement,
  InputProps & { leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }
>(({ className, leftIcon, rightIcon, ...props }, ref) => {
  return (
    <div className="relative flex items-center">
      {leftIcon && <div className="pointer-events-none absolute left-2">{leftIcon}</div>}
      <Input
        className={cn(leftIcon && 'pl-7', rightIcon && 'pr-7', className)}
        ref={ref}
        {...props}
      />
      {rightIcon && <div className="pointer-events-none absolute right-2">{rightIcon}</div>}
    </div>
  )
})
InputWithIcons.displayName = 'Input'

export { InputWithIcons }
