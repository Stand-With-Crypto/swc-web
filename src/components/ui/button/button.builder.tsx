import { Builder } from '@builder.io/react'
import dynamic from 'next/dynamic'

Builder.registerComponent(
  dynamic(() => import('.').then(mod => mod.Button)),
  {
    name: 'Button',
    inputs: [
      {
        name: 'children',
        type: 'text',
        defaultValue: 'Click me',
      },
    ],
  },
)
