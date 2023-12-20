'use client'

import { navbarSessionButtonMessages } from '@/components/app/navbarSessionButton/navbarSessionButtonClient.messages'
import { Button } from '@/components/ui/button'
import { NextImage } from '@/components/ui/image'
import { GetDefineMessageResults } from '@/types'
import { cn } from '@/utils/web/cn'
import { maybeEllipsisText } from '@/utils/web/maybeEllipsisText'
import { ConnectWallet, useAddress, useUser } from '@thirdweb-dev/react'
import { useRouter } from 'next/navigation'

export function NavbarSessionButtonClient(props: {
  messages: GetDefineMessageResults<typeof navbarSessionButtonMessages>
}) {
  // TODO match figma mockups
  const address = useAddress()
  const router = useRouter()
  return (
    <ConnectWallet
      auth={{
        loginOptional: false,
        onLogin() {
          // ensure that any server components on the page that's being used are refreshed with the context the user is now logged in
          router.refresh()
        },
      }}
      className={
        /* 
        This is a super hacky way of ensuring our button styles override the default styles of the ConnectWallet. 
        I copy pasted the button classes and then added !important to each of them https://tailwindcss.com/docs/configuration#important-modifier.
        We'll need to re-update these styles when we modify the actual button component's styles 
        Excited for someone to come up with a more elegant approach.
        */
        cn(
          // copy pasted main button code
          '!inline-flex !items-center !justify-center !whitespace-nowrap !rounded-full !text-sm !font-medium !ring-offset-background !transition-colors focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!pointer-events-none disabled:!opacity-50',
          // copy pasted secondary variant code
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          // copy pasted default size code
          '!h-10 !px-4 !py-2',
        )
      }
      theme={'dark'}
      modalSize={'compact'}
      btnTitle={'Log in'}
      detailsBtn={() => (
        <Button variant="secondary">
          <NextImage
            alt={props.messages.defaultUserLogoAlt}
            src={'/defaultUserLogo.svg'}
            width={20}
            height={20}
          />
          <div className="ml-2 min-w-[70px]">{address && maybeEllipsisText(address, 10)}</div>
        </Button>
      )}
    />
  )
}
