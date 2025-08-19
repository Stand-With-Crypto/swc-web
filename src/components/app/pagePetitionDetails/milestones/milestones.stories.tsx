import type { Meta, StoryObj } from '@storybook/react'

import { SupportedLocale } from '@/utils/shared/supportedLocales'

import { PetitionMilestones } from '.'

const meta = {
  title: 'App/PagePetitionDetails/PetitionMilestones',
  component: PetitionMilestones,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  args: {
    goal: 100000,
    shouldGenerateAutomaticMilestones: true,
    additionalMilestones: [],
    currentSignatures: 15000,
    locale: SupportedLocale.EN_US,
  },
  argTypes: {
    goal: {
      control: { type: 'number', min: 1000, max: 10000000, step: 1000 },
      description: 'Total signature goal for the petition',
    },
    currentSignatures: {
      control: { type: 'number', min: 0 },
      description: 'Current number of signatures',
    },
    shouldGenerateAutomaticMilestones: {
      control: 'boolean',
      description: 'Generate automatic milestones at 10%, 25%, 50%, 100% of goal',
    },
    locale: {
      control: 'select',
      options: [SupportedLocale.EN_US],
      description: 'Locale for formatting numbers',
    },
  },
} satisfies Meta<typeof PetitionMilestones>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const WithProgressAndMilestones: Story = {
  args: {
    currentSignatures: 35000,
    goal: 100000,
    additionalMilestones: [
      { label: 'Media coverage milestone', isComplete: true },
      { label: 'Celebrity endorsement', isComplete: false },
    ],
  },
}

export const OnlyCustomMilestones: Story = {
  args: {
    shouldGenerateAutomaticMilestones: false,
    additionalMilestones: [
      { label: 'First 1K supporters', isComplete: true },
      { label: 'Viral on social media', isComplete: false },
      { label: 'Congressional response', isComplete: false },
    ],
  },
}

export const Empty: Story = {
  args: {
    shouldGenerateAutomaticMilestones: false,
    additionalMilestones: [],
  },
}
