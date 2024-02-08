import { FormattedRelativeDatetime } from '@/components/ui/formattedRelativeDatetime'
import { Skeleton } from '@/components/ui/skeleton'
import { useHasHydrated } from '@/hooks/useHasHydrated'

export function FormattedRelativeDatetimeWithClientHydration(
  props: React.ComponentPropsWithoutRef<typeof FormattedRelativeDatetime>,
) {
  const hasHydrated = useHasHydrated()
  if (!hasHydrated) {
    return <Skeleton>a while ago</Skeleton>
  }
  return <FormattedRelativeDatetime {...props} />
}
