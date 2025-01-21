import { Builder } from '@builder.io/react'

import { HeroCTA } from '@/components/app/heroCTA'

Builder.registerComponent(() => <HeroCTA />, {
  name: 'HeroCTA',
  canHaveChildren: false,
  override: true,
})
