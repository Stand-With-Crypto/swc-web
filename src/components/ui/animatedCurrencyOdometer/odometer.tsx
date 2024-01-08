'use client'

import { useEffect, useMemo, useRef } from 'react'
import { FormattedCurrency } from '@/components/ui/formattedCurrency'
import { SupportedLocale } from '@/intl/locales'
import { SupportedFiatCurrencyCodes } from '@/utils/shared/currency'

import styles from './odometer.module.css'

const regexPattern = /(\D+)?(\d+)(\D+)?(\d+)?(\D+)?(\d+)?(\D+)?/
const time = 600
const DEFAULT_DONATION_VALUE = 2_399_800

export interface AnimatedCurrencyOdometerProps {
  value?: number
}

function AnimatedCurrencyOdometerClientSide({
  value = DEFAULT_DONATION_VALUE,
}: AnimatedCurrencyOdometerProps) {
  const spanArray = useRef<(HTMLSpanElement | null)[]>([])

  const formattedValue = useMemo(() => {
    return formatCurrency(value)
  }, [value])

  const valueNumericalLength = useMemo(() => {
    return formattedValue.replace(/\D/g, '').length
  }, [formattedValue])

  /**
   * @description numeralArray uses regex to split the donation value into an array of strings.
   * @example // $2,395,081 => ["$", "2", ",", "395", ",", "081"]
   */
  const numeralArray = useMemo(() => {
    const rgxExecArray = regexPattern.exec(formattedValue)

    if (rgxExecArray) {
      const arrayValue = [...rgxExecArray]
      arrayValue.shift()

      return arrayValue.filter(val => val)
    }

    return []
  }, [formattedValue])

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
    <h1 className={styles.odometer}>
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

function formatCurrency(value: number) {
  const response = new Intl.NumberFormat(SupportedLocale.EN_US, {
    style: 'currency',
    currency: SupportedFiatCurrencyCodes.USD,
    maximumFractionDigits: 0,
  }).format(value)
  return response
}

function FallbackDonationValue() {
  return (
    <h1 className="odometer">
      <FormattedCurrency
        locale={SupportedLocale.EN_US}
        amount={DEFAULT_DONATION_VALUE}
        currencyCode={SupportedFiatCurrencyCodes.USD}
      />
    </h1>
  )
}

export const AnimatedCurrencyOdometer = function AnimatedDonationValue(
  props: AnimatedCurrencyOdometerProps,
) {
  return <AnimatedCurrencyOdometerClientSide {...props} />
}
