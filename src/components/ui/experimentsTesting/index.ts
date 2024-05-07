import { useLocalUser } from '@/hooks/useLocalUser'
import { Experiments, ExperimentVariant } from '@/utils/shared/experiments'

function useABTesting<K extends Experiments>({ experimentName }: { experimentName: K }) {
  const localUser = useLocalUser()

  const variant = localUser?.persisted?.experiments?.[experimentName]

  return variant
}

type ExperimentsComponentVariants<K extends Experiments> = {
  component: React.ReactNode
  name: ExperimentVariant<K>
}

type ExperimentsComponentProps<K extends Experiments> = {
  experimentName: K
  variants: ExperimentsComponentVariants<K>[]
}

export function ExperimentsTesting<K extends Experiments>({
  experimentName,
  variants,
}: ExperimentsComponentProps<K>) {
  const variant = useABTesting({ experimentName })

  const ComponentToRender = variants.find(v => v.name === variant)?.component

  return ComponentToRender
}
