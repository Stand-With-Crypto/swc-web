import { useMemo } from 'react'

const FORMATTED_CURRENCY_BLOCK_REGEX = /(\D+)?(\d+)(\D+)?(\d+)?(\D+)?(\d+)?(\D+)?/

export function useNumeralArray(formattedValue: string) {
  /**
   * @description numeralArray uses regex to split the donation value into an array of strings.
   * @example // $2,395,081 => ["$", "2", ",", "395", ",", "081"]
   */
  const numeralArray = useMemo(() => {
    const rgxExecArray = FORMATTED_CURRENCY_BLOCK_REGEX.exec(formattedValue)

    if (rgxExecArray) {
      const arrayValue = [...rgxExecArray]
      arrayValue.shift()

      return arrayValue.filter(val => val)
    }

    return []
  }, [formattedValue])

  return numeralArray
}
