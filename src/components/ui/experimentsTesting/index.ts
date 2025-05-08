import { useLocalUser } from '@/hooks/useLocalUser'
import {
  Experiments,
  getDefaultExperimentContext,
  getExperimentVariants,
  IExperimentContext,
} from '@/utils/shared/experiments'

export function useExperimentName<K extends Experiments>({
  experimentName,
}: {
  experimentName: K
}) {
  const localUser = useLocalUser()

  const experimentVariants = getExperimentVariants(experimentName)

  const variant = localUser?.persisted?.experiments?.[experimentName]
  const defaultVariant = getDefaultExperimentContext()[experimentName]

  if (!variant || !experimentVariants?.includes(variant)) return defaultVariant

  return variant
}

interface ExperimentsComponentProps<K extends Experiments> {
  experimentName: K
  variants: Record<IExperimentContext[K], React.ReactNode>
}

export function ExperimentsTesting<K extends Experiments>({
  experimentName,
  variants,
}: ExperimentsComponentProps<K>) {
  const variant = useExperimentName({ experimentName })

  return variants[variant]
}
