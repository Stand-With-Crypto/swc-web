import type { Meta } from '@storybook/react'

import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSILetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'

const meta = {
  title: 'App/DTSIFormattedLetterGrade',
  component: DTSIFormattedLetterGrade,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof DTSIFormattedLetterGrade>

export default meta

export const Default = {
  render: () => {
    const grades: Array<DTSILetterGrade | null> = [
      null,
      DTSILetterGrade.A,
      DTSILetterGrade.B,
      DTSILetterGrade.C,
      DTSILetterGrade.D,
      DTSILetterGrade.F,
    ]
    return (
      <div className="space-y-8">
        {grades.map(grade => (
          <div className="flex flex-col gap-4 md:flex-row" key={grade}>
            <DTSIFormattedLetterGrade className="h-14 w-14" letterGrade={grade} />
          </div>
        ))}
      </div>
    )
  },
}
