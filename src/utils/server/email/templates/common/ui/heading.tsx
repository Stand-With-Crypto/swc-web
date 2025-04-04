import { Heading as EmailHeading, HeadingProps as EmailHeadingProps } from '@react-email/components'
import { cva, VariantProps } from 'class-variance-authority'
import { ClassValue } from 'clsx'

import { cn } from '@/utils/web/cn'

const headingVariantsConfig = {
  size: {
    lg: 'text-3xl',
    md: 'text-xl',
    sm: 'text-base md:text-lg',
    xs: 'text-sm md:text-base',
  },
  gutterBottom: {
    none: '',
    md: 'mb-4',
    sm: 'mb-2',
  },
  align: {
    center: 'text-center',
    start: 'text-start',
  },
} satisfies Record<string, Record<string, ClassValue>>
const headingVariants = cva('my-0 font-bold', {
  variants: headingVariantsConfig,
  defaultVariants: {
    size: 'lg',
    gutterBottom: 'none',
    align: 'center',
  },
})

type HeadingProps = EmailHeadingProps & VariantProps<typeof headingVariants>

export function Heading({ size, gutterBottom, align, className, ...props }: HeadingProps) {
  return (
    <EmailHeading
      {...props}
      className={cn(headingVariants({ size, gutterBottom, align, className }))}
    />
  )
}
