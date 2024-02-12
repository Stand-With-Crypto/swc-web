import { FormattedDatetime } from '@/components/ui/formattedDatetime'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasHydrated } from '@/hooks/useHasHydrated'

export function FormattedDatetimeWithClientHydration(
  props: React.ComponentPropsWithoutRef<typeof FormattedDatetime>,
) {
  const hasHydrated = useHasHydrated()
  if (!hasHydrated) {
    return <Skeleton>a while ago</Skeleton>
  }
  return <FormattedDatetime {...props} />
}
