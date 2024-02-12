import { expect } from '@jest/globals'

import { cn } from './cn'

it('strips conflicting classes', () => {
  expect(cn('text-red-500', 'text-red-600')).toBe('text-red-600')
})
