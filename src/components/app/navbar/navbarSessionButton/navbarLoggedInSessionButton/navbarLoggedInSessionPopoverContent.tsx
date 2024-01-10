'use client'

import { UserActionFormOptInSWCDialog } from '@/components/app/userActionFormOptInSWC/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useThirdWeb } from '@/hooks/useThirdWeb'
import { Wallet } from 'lucide-react'

export function NavbarLoggedInSessionPopoverContent() {
  const { getParsedAddress, logoutAndDisconnect, formattedBalance, wallet, ...rest } = useThirdWeb()

  console.log(rest)

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-4">
          <div className="w-fit rounded-full bg-secondary p-3">
            <Wallet width={20} height={20} />
          </div>

          <span>{getParsedAddress({ numStartingChars: 6 })}</span>
        </div>

        <UserActionFormOptInSWCDialog>
          <Button className="w-full">JOIN THE FIGHT</Button>
        </UserActionFormOptInSWCDialog>
      </div>
      <hr />
      <div className="flex flex-col gap-6 p-4">
        <Info label="Balance" value={formattedBalance} />

        <Info label="Current network" value={wallet?.walletId} />

        <Button className="w-full" onClick={logoutAndDisconnect}>
          Logout
        </Button>
      </div>
    </div>
  )
}

interface InfoProps {
  label: string
  value?: string
  image?: {
    src: string
    alt: string
  }
}

function Info({ label, image, value }: InfoProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex">{value}</div>
    </div>
  )
}
