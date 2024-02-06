'use client'

import { useEffect, useMemo, useRef } from 'react'
import { SupportedLocale } from '@/intl/locales'

import { useCurrencyNumeralArray } from './useCurrencyNumericalArray'
import styles from './odometer.module.css'

const time = 600
const DEFAULT_DONATION_VALUE = 2_399_800

export interface AnimatedCurrencyOdometerProps {
  value?: number
  locale?: SupportedLocale
}

export function AnimatedCurrencyOdometer({
  value = DEFAULT_DONATION_VALUE,
  locale,
}: AnimatedCurrencyOdometerProps) {
  const spanArray = useRef<(HTMLSpanElement | null)[]>([])

  const valueNumericalLength = useMemo(() => {
    return String(value).length
  }, [value])

  const numeralArray = useCurrencyNumeralArray(value, locale)

  useEffect(() => {
    const activate = () => {
      setTimeout(() => {
        for (const spanElement of spanArray.current) {
          if (spanElement) {
            const dist = Number(spanElement.getAttribute('data-value')) + 1
            spanElement.style.transform = `translateY(-${dist * 100}%)`
          }
        }
      }, time)
    }

    activate()
  }, [numeralArray])

  return (
    <h1
      className={styles.odometer}
      style={{
        fontFeatureSettings: `'tnum', 'lnum'`,
      }}
    >
      {numeralArray.map((numeralGroup, numeralGroupIndex) => {
        /**
         * numeralGroup can be a single string characther like "$" or "," OR a number like "2" or "395" or "081".
         */
        if (Number.isNaN(Number(numeralGroup))) {
          return <span key={numeralGroupIndex}>{numeralGroup}</span>
        }

        /**
         * digit is a single digit number like "8".
         */
        return Array.from(numeralGroup).map((digit, digitIndex) => {
          return (
            <span
              key={digitIndex}
              data-value={digit}
              ref={el => {
                if (el && spanArray.current.length < valueNumericalLength) {
                  spanArray.current.push(el)
                }
              }}
            >
              <span>&ndash;</span>

              {/**
               * here we create a an array up until the digit number, eg. [0, 1, 2, 3, 4, 5, 6, 7, 8].
               * then we create a span for each number in the array. They will be stacked on top of each other (flex-direction: column).
               */}
              {Array.from({ length: Number(digit) + 1 }, (_, number) => (
                <span key={number}>{number}</span>
              ))}
            </span>
          )
        })
      })}
    </h1>
  )
}
