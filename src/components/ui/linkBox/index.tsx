import React from 'react'

import { cn } from '@/utils/web/cn'

import styles from './linkBox.module.css'

export const LinkBox = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn(styles.base, className)} {...props} ref={ref} />
  },
)
LinkBox.displayName = 'LinkBox'
export const linkBoxLinkClassName = styles.overlay
