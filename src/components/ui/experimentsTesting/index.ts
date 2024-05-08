import { useLocalUser } from '@/hooks/useLocalUser'
import {
  Experiments,
  getDefaultExperimentContext,
  IExperimentContext,
} from '@/utils/shared/experiments'

function useExperimentName<K extends Experiments>({ experimentName }: { experimentName: K }) {
  const localUser = useLocalUser()

  const variant = localUser?.persisted?.experiments?.[experimentName]
  const defaultVariant = getDefaultExperimentContext()[experimentName]

  return variant ?? defaultVariant
}

type ExperimentsComponentProps<K extends Experiments> = {
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
