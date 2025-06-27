'use client'
import { noop } from 'lodash-es'

import { Layout } from '@/components/app/pageLocalPolicy/common/layout'
import { PlacesSelect } from '@/components/app/pageLocalPolicy/common/stateSearch'
import { UsHeader } from '@/components/app/pageLocalPolicy/us/header'
import { UsStateList } from '@/components/app/pageLocalPolicy/us/stateList'
import { Skeleton } from '@/components/ui/skeleton'

export function UsLocalPolicySkeleton() {
  return (
    <Layout>
      <UsHeader />

      <Skeleton>
        <PlacesSelect loading onChange={noop} value={null} />
      </Skeleton>

      <UsStateList searchResult={null} />
    </Layout>
  )
}
