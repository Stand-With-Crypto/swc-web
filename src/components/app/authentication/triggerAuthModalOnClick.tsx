'use client'

import { AutoOpenAuthModal } from '@/components/app/authentication/autoOpenAuthModal'
import { ThirdwebLoginButtonProps } from '@/components/app/authentication/thirdwebLoginButton'
import { Slot } from '@radix-ui/react-slot'
import React from 'react'
import { useInterval } from 'react-use'

/*
Because Thirdweb doesn't offer the modal component as a primitive that can be triggered decoupled from the button, 
we need to hide the button and simulate it being clicked to get the modal to appear when
an item other than the default button UX needs to trigger the modal
They also don't offer any onClose callbacks so we need to poll the DOM to see if the dialog modal is open or not. 
if it isn't we need to reset the shouldRenderModal value so that if the button gets reclicked, the modal will reopen

super hacky, lmk if you have a better strategy
*/
export function TriggerAuthModalOnClick({
  children,
  loginButtonProps,
}: {
  children: React.ReactNode
  loginButtonProps: ThirdwebLoginButtonProps
}) {
  const [shouldRenderModal, setShouldRenderModal] = React.useState(false)
  useInterval(
    () => {
      if (shouldRenderModal) {
        const dialog = document.querySelector('[role="dialog"]')
        if (!dialog) {
          setShouldRenderModal(false)
        }
      }
    },
    shouldRenderModal ? 1000 : null,
  )
  return (
    <>
      {shouldRenderModal && (
        <AutoOpenAuthModal {...loginButtonProps} refStyles={{ display: 'none' }}>
          Login
        </AutoOpenAuthModal>
      )}
      <Slot onClick={() => setShouldRenderModal(true)}>{children}</Slot>
    </>
  )
}
