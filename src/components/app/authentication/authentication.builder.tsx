import React from 'react'
import { Builder, withChildren } from '@builder.io/react'

import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { BuilderComponentBaseProps } from '@/utils/web/builder'

const REQUIRE_AUTHENTICATION_BLOCK_NAME = 'RequireAuthentication'
const UNAUTHENTICATED_BLOCK_NAME = 'RequireAuthentication:Unauthenticated'
const AUTHENTICATED_BLOCK_NAME = 'RequireAuthentication:Authenticated'

Builder.registerComponent(
  withChildren((props: BuilderComponentBaseProps) => {
    const isAuthenticated = props.builderState?.state.isAuthenticated

    const unauthenticatedBlockId = props.builderBlock?.children.find(
      ({ component }) => component.name === UNAUTHENTICATED_BLOCK_NAME,
    )?.id

    const authenticatedBlockId = props.builderBlock?.children.find(
      ({ component }) => component.name === AUTHENTICATED_BLOCK_NAME,
    )?.id

    if (!Array.isArray(props.children)) {
      return null
    }

    const UnauthenticatedBlock = unauthenticatedBlockId
      ? (props.children as React.ReactElement[]).find(({ key }) => key === unauthenticatedBlockId)
      : null

    const AuthenticatedBlock = authenticatedBlockId
      ? (props.children as React.ReactElement[]).find(({ key }) => key === authenticatedBlockId)
      : null

    const withWrapper = (content: React.ReactNode) => (
      <div {...props.attributes} key={props.attributes?.key}>
        {content}
      </div>
    )

    if (Builder.isEditing) {
      return withWrapper(isAuthenticated ? AuthenticatedBlock : UnauthenticatedBlock)
    }

    return (
      <LoginDialogWrapper authenticatedContent={withWrapper(AuthenticatedBlock)}>
        {withWrapper(UnauthenticatedBlock)}
      </LoginDialogWrapper>
    )
  }),
  {
    name: REQUIRE_AUTHENTICATION_BLOCK_NAME,
    canHaveChildren: true,
    noWrap: true,
    childRequirements: {
      message: `This component must have two children: ${UNAUTHENTICATED_BLOCK_NAME} and ${AUTHENTICATED_BLOCK_NAME}`,
      query: {
        'component.name': {
          $in: [UNAUTHENTICATED_BLOCK_NAME, AUTHENTICATED_BLOCK_NAME],
        },
      },
    },
    defaultChildren: [
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: UNAUTHENTICATED_BLOCK_NAME,
        },
      },
      {
        '@type': '@builder.io/sdk:Element',
        component: {
          name: AUTHENTICATED_BLOCK_NAME,
        },
      },
    ],
  },
)

Builder.registerComponent(
  withChildren((props: BuilderComponentBaseProps) => props.children),
  {
    name: UNAUTHENTICATED_BLOCK_NAME,
    hideFromInsertMenu: true,
    canHaveChildren: true,
    fragment: true,
    requiresParent: {
      message: `This component must be a child of ${REQUIRE_AUTHENTICATION_BLOCK_NAME}`,
      component: REQUIRE_AUTHENTICATION_BLOCK_NAME,
    },
  },
)

Builder.registerComponent(
  withChildren((props: BuilderComponentBaseProps) => props.children),
  {
    name: AUTHENTICATED_BLOCK_NAME,
    hideFromInsertMenu: true,
    canHaveChildren: true,
    fragment: true,
    requiresParent: {
      message: `This component must be a child of ${REQUIRE_AUTHENTICATION_BLOCK_NAME}`,
      component: REQUIRE_AUTHENTICATION_BLOCK_NAME,
    },
  },
)
