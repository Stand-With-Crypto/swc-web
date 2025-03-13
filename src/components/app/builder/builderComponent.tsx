'use client'

import { type ComponentProps } from 'react'
import { Builder, BuilderComponent } from '@builder.io/react'
import { notFound } from 'next/navigation'

import { useSession } from '@/hooks/useSession'
import { BuilderState } from '@/utils/web/builder/types'

type BuilderPageProps = ComponentProps<typeof BuilderComponent>

export function RenderBuilderContent({ model, ...props }: BuilderPageProps) {
  const session = useSession()

  const builderData: BuilderState = {
    // This prop should only be used in the context of the Builder.io editor when editing or previewing
    // We should never use it for the actual rendering of the component
    mockIsAuthenticated: session.isLoggedIn,
  }

  if (props.content || Builder.isEditing) {
    return <BuilderComponent {...props} data={builderData} model={model} />
  }

  return notFound()
}
