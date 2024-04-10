import { expect, it } from '@jest/globals'

import { EXPERIMENTS_CONFIG } from '@/utils/shared/experiments'

it('all experiment variants should sum to 1', () => {
  Object.values(EXPERIMENTS_CONFIG).forEach(experiment => {
    const sum = experiment.variants.reduce((acc, variant) => acc + variant.percentage, 0)
    expect(sum).toBe(1)
  })
})
