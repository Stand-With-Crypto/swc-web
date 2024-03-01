import type { Meta, StoryObj } from '@storybook/react'

import { GooglePlacesSelect } from '.'

const meta = {
  title: 'UI/GooglePlacesSelect',
  component: GooglePlacesSelect,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GooglePlacesSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: {
    value: {
      description:
        'Some really long string of characters that makes the input weird Some really long string of characters that makes the input weird',
      place_id: 'test',
    },
    onChange: () => {},
  },
}
