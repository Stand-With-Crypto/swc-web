import React from 'react'

import styles from './linkBox.module.css'

import { cn } from '@/utils/web/cn'

export const LinkBox = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn(styles.base, className)} {...props} ref={ref} />
  },
)
LinkBox.displayName = 'LinkBox'
export const linkBoxLinkClassName = styles.overlay
