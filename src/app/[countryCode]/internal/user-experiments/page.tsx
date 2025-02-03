'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { useLocalUser } from '@/hooks/useLocalUser'
import { EXPERIMENTS_CONFIG } from '@/utils/shared/experiments'
import { setLocalUserPersistedValues } from '@/utils/web/clientLocalUser'

export const dynamic = 'error'

export default function ExperimentsHomepage() {
  const localUser = useLocalUser()
  const hasHydrated = useHasHydrated()
  const experiments = localUser.persisted?.experiments
  return (
    <div className="container mx-auto mt-10">
      <div className="space-y-7 lg:space-y-10">
        {!hasHydrated ? null : !experiments ? (
          <p>Users who reject cookies are opted out of experiments</p>
        ) : (
          Object.keys(EXPERIMENTS_CONFIG).map(_experiment => {
            const experiment = _experiment as keyof typeof EXPERIMENTS_CONFIG
            return (
              <div key={experiment}>
                <h2 className="mb-2 text-xl font-bold">Experiment {experiment}</h2>
                <Select
                  onValueChange={variant => {
                    setLocalUserPersistedValues({
                      experiments: { ...experiments, [experiment]: variant },
                    })
                    window.location.reload()
                  }}
                  value={experiments[experiment]}
                >
                  <SelectTrigger className="w-[195px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIMENTS_CONFIG[experiment].variants.map(variant => (
                      <SelectItem key={variant.name} value={variant.name}>
                        {variant.name} ({variant.percentage * 100}% of users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
