'use client'

import { type HTMLProps, useEffect, useRef } from 'react'
import ReactOdometer from 'odometer'
import 'odometer/themes/odometer-theme-default.css'

export interface OdometerProps extends HTMLProps<HTMLDivElement> {
  /**
   * Count is a simpler animation method which just increments the value, use it when you're looking for something more
   * subtle.
   */
  animation?: 'count'
  /**
   * Change how long the javascript expects the CSS animation to take.
   * @default 2000
   */
  duration?: number
  /**
   * Change how digit groups are formatted, and how many digits are shown after the decimal point.
   * (,ddd)    -  12,345,678
   * (,ddd).dd -  12,345,678.09
   * (.ddd),dd -  12.345.678,09
   * d         -  12345678
   */
  format?: string
  /**
   * Specify the theme (if you have more than one theme css file on the page).
   * Will add CSS class .odometer-theme-{prop value} to wrapper `div`.
   */
  theme?: string
  /**
   * Current value. Change it to run animation.
   */
  value: number
}

export function Odometer({ animation, duration, format, theme, value, ...rest }: OdometerProps) {
  const node = useRef<HTMLSpanElement>(null)
  const odometer = useRef<ReactOdometer>()

  useEffect(() => {
    if (!node.current || typeof document === 'undefined') {
      return
    }

    odometer.current = new ReactOdometer({
      el: node.current,
      auto: false,
      animation,
      duration,
      format,
      theme,
      value,
    })
  }, [])

  useEffect(() => {
    odometer.current?.update(value)
  }, [value])

  return <span ref={node} {...rest} />
}
