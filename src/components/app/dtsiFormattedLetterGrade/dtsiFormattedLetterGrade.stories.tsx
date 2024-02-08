import { DTSIFormattedLetterGrade } from '@/components/app/dtsiFormattedLetterGrade'
import { DTSILetterGrade } from '@/utils/dtsi/dtsiStanceScoreUtils'
import type { Meta } from '@storybook/react'

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
    const sizes = [25, 40, 60, 150]
    return (
      <div className="space-y-8">
        {grades.map(grade => (
          <div key={grade} className="flex flex-col gap-4 md:flex-row">
            {sizes.map(size => (
              <div key={size}>
                <DTSIFormattedLetterGrade size={size} letterGrade={grade} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  },
}
