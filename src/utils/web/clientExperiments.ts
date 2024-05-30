import {
  Experiments,
  EXPERIMENTS_CONFIG,
  ExperimentVariant,
  IExperimentContext,
} from 'src/utils/shared/experiments'

import { gracefullyError } from '@/utils/shared/gracefullyError'
import { PersistedLocalUser } from '@/utils/shared/localUser'

function getRandomExperimentVariant<K extends Experiments>(experiment: K): ExperimentVariant<K> {
  const randomValue = Math.random()
  const variantConfigs = EXPERIMENTS_CONFIG[experiment].variants

  let cumulativePercentage = 0
  const finalVariant = variantConfigs.find(variant => {
    cumulativePercentage += variant.percentage
    return cumulativePercentage >= randomValue
  })

  if (!finalVariant) {
    const variant = variantConfigs[0].name as ExperimentVariant<K>
    return gracefullyError({
      msg: `Failed to find a variant for experiment ${experiment}`,
      hint: { extra: { randomValue, variantConfigs } },
      fallback: variant,
    })
  }
  return finalVariant.name as ExperimentVariant<K>
}

export function getAllExperiments(persisted: PersistedLocalUser | null) {
  const allExperiments = {} as IExperimentContext
  let hasUpdates = false
  Object.keys(EXPERIMENTS_CONFIG).forEach(_experiment => {
    const experiment = _experiment as Experiments
    const existingVariant = persisted?.experiments?.[experiment]
    if (existingVariant) {
      // @ts-ignore
      allExperiments[experiment] = existingVariant
    } else {
      const randomVariant = getRandomExperimentVariant(experiment)
      // @ts-ignore
      allExperiments[experiment] = randomVariant
      hasUpdates = true
    }
  })

  // check if there's any old experiments that need to be removed from persisted user
  if (
    !hasUpdates &&
    persisted?.experiments &&
    Object.keys(persisted.experiments).some(experiment => !(experiment in allExperiments))
  ) {
    hasUpdates = true
  }

  return { experiments: allExperiments, hasUpdates }
}
