import type { Meta, StoryObj } from '@storybook/react'

import { Button } from '@/components/ui/button'

import { UserActionFormPetitionSignatureDialog } from './dialog'

const meta = {
  title: 'App/UserActionFormPetitionSignature',
  component: UserActionFormPetitionSignatureDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    title: 'Petition title',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    goal: 100000,
    signatures: 58209,
  },
  argTypes: {
    children: { table: { disable: true } },
    defaultOpen: { table: { disable: true } },
    title: {
      control: 'text',
      description: 'The petition title displayed in the modal',
    },
    description: {
      control: 'text',
      description: 'The petition description displayed below the title',
    },
    goal: {
      control: { type: 'number', min: 1000, max: 10000000, step: 1000 },
      description: 'Total signature goal for the petition',
    },
    signatures: {
      control: { type: 'number', min: 0 },
      description: 'Current number of signatures',
    },
  },
} satisfies Meta<typeof UserActionFormPetitionSignatureDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {} as any,
  render: args => {
    return (
      <UserActionFormPetitionSignatureDialog {...args}>
        <Button>Sign Petition</Button>
      </UserActionFormPetitionSignatureDialog>
    )
  },
}

export const NearlyComplete: Story = {
  args: {} as any,
  render: args => {
    return (
      <UserActionFormPetitionSignatureDialog {...args} goal={100000} signatures={95000}>
        <Button>Sign Petition</Button>
      </UserActionFormPetitionSignatureDialog>
    )
  },
}

export const JustStarted: Story = {
  args: {} as any,
  render: args => {
    return (
      <UserActionFormPetitionSignatureDialog {...args} goal={100000} signatures={1250}>
        <Button>Sign Petition</Button>
      </UserActionFormPetitionSignatureDialog>
    )
  },
}

export const LargePetition: Story = {
  args: {} as any,
  render: args => {
    return (
      <UserActionFormPetitionSignatureDialog
        {...args}
        description="Help us reach our goal to show Congress that Americans support clear, balanced cryptocurrency regulations that protect consumers while fostering innovation."
        goal={1000000}
        signatures={750000}
        title="Support Cryptocurrency Innovation Act"
      >
        <Button variant="primary-cta">Join the Movement</Button>
      </UserActionFormPetitionSignatureDialog>
    )
  },
}
