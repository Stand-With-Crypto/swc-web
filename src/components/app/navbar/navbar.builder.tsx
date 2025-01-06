import { Builder } from '@builder.io/react'
import dynamic from 'next/dynamic'

Builder.registerComponent(
  dynamic(() => import('.').then(mod => mod.Navbar)),
  {
    name: 'Navbar',
    inputs: [],
  },
)
