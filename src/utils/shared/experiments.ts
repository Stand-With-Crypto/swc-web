/*
Our experiments utilities provide a lightweight way for us to run experiments/measure the results of those experiments on the site.
To add a new experiment:
1. Add a new key to the `EXPERIMENTS_CONFIG` object with the experiment name as the key.
2. Add the variants for the experiment as an array of objects with the following properties:
  - `name`: the name of the variant
  - `percentage`: the percentage of users that should see this variant. This should be a number between 0 and 1. NOTE: The sum of all variant percentages should be equal to 1.

How it works:
All users are assigned a random variant for all active experiments. This assignment is persisted as a cookie so that the user sees the same variant on subsequent visits.
We pass these variants to all mixpanel events triggered on the client and the server. Within mixpanel you can breakdown events by these variants to see how they impact user behavior.
Within a given component, you can reference the users current experiments (using the useLocalUser hook) and conditionally render different UI based on the variant the user has been assigned.

Important notes:
- Do not change the `name` property of an experiment once it has been set. This is the key that is used to track the experiment and changing it will break the ability to track the experiment.
- Do not change the `analyticsPropertyName` property of an experiment once it has been set. This is the human readable name that is passed to mixpanel and changing it will break the ability to track the experiment.
*/

interface ExperimentConfig {
  name: string
  analyticsPropertyName: string // human readable name passed to mixpanel.
  variants: Array<{
    name: string
    percentage: number // number 0 - 1, sum of all variants must be less than 1
  }>
}
// all experiment names should be prefixed with the github issue associated w/ the experiment and human readable descriptor

export const EXPERIMENTS_CONFIG = {
  gh00_TestExperiment: {
    analyticsPropertyName: 'GH000 Test Experiment',
    variants: [
      { name: 'control' as const, percentage: 0.5 },
      { name: 'variant' as const, percentage: 0.5 },
    ],
  },
  gh01_TestExperiment2: {
    analyticsPropertyName: 'GH000 Test Experiment #2',
    variants: [
      { name: 'control2' as const, percentage: 0.5 },
      { name: 'variant2' as const, percentage: 0.5 },
    ],
  },
} satisfies Record<string, Omit<ExperimentConfig, 'name'>>
export type Experiments = keyof typeof EXPERIMENTS_CONFIG
type _ExperimentVariantsConfig<K extends Experiments> =
  (typeof EXPERIMENTS_CONFIG)[K]['variants'] extends (infer U)[] ? U : never

export type ExperimentVariant<K extends Experiments> =
  // @ts-ignore
  _ExperimentVariantsConfig<K>['name']

export type IExperimentContext = {
  [K in Experiments]: ExperimentVariant<K>
}

export function getDefaultExperimentContext() {
  const context = {} as IExperimentContext
  Object.keys(EXPERIMENTS_CONFIG).forEach(_experiment => {
    const experiment = _experiment as Experiments
    const firstVariant = EXPERIMENTS_CONFIG[experiment].variants[0].name
    // @ts-ignore
    context[experiment] = firstVariant
  })
  return context
}

export function getExperimentVariants(experiment: Experiments) {
  return EXPERIMENTS_CONFIG[experiment].variants.map(({ name }) => name)
}
