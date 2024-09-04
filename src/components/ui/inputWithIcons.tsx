import * as React from 'react'
import { cva, VariantProps } from 'class-variance-authority'

import { Input, InputProps } from '@/components/ui/input'
import { cn } from '@/utils/web/cn'

const getInputVariants = ({ leftIcon, rightIcon }: { leftIcon?: boolean; rightIcon?: boolean }) =>
  cva('h-auto', {
    variants: {
      variant: {
        sm: cn('min-h-8', leftIcon && 'pl-6', rightIcon && 'pr-6'),
        md: cn('min-h-10', leftIcon && 'pl-7', rightIcon && 'pr-7'),
        lg: cn('min-h-14', leftIcon && 'pl-12', rightIcon && 'pr-12'),
      },
    },
    defaultVariants: {
      variant: 'md',
    },
  })

const iconVariants = cva('pointer-events-none absolute', {
  variants: {
    left: {
      sm: 'left-2',
      md: 'left-2',
      lg: 'left-5',
    },
    right: {
      sm: 'right-2',
      md: 'right-2',
      lg: 'right-5',
    },
  },
  defaultVariants: {
    left: 'md',
    right: 'md',
  },
})

export interface InputWithIconsProps
  extends InputProps,
    VariantProps<ReturnType<typeof getInputVariants>> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const InputWithIcons = React.forwardRef<HTMLInputElement, InputWithIconsProps>(
  ({ className, leftIcon, rightIcon, variant, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div
            className={iconVariants({
              left: variant,
            })}
          >
            {leftIcon}
          </div>
        )}
        <Input
          className={cn(
            getInputVariants({
              leftIcon: React.isValidElement(leftIcon),
              rightIcon: React.isValidElement(rightIcon),
            })({
              variant,
            }),
            className,
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div
            className={iconVariants({
              right: variant,
            })}
          >
            {rightIcon}
          </div>
        )}
      </div>
    )
  },
)
InputWithIcons.displayName = 'Input'

export { InputWithIcons }
