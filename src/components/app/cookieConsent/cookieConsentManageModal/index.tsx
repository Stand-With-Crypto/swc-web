import React from 'react'
import { DialogProps } from '@radix-ui/react-dialog'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useDialog } from '@/hooks/useDialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { cn } from '@/utils/web/cn'

import { CookiePreferencesForm } from './cookiePreferencesForm'

interface ManageCookiesModalProps {
  onSubmit: (accepted: CookieConsentPermissions) => void
  children: React.ReactNode
}

export default function ManageCookiesModal({ onSubmit, children }: ManageCookiesModalProps) {
  const dialogProps = useDialog({ analytics: 'Cookie Consent Management' })
  const {
    isMobile,
    Container,
    ContainerTrigger,
    ContainerContent,
    ContainerHeader,
    ContainerTitle,
  } = useParentComponent()

  const handleManageCookiesSubmit = (values: CookieConsentPermissions) => {
    onSubmit(values)
    dialogProps.onOpenChange(false)
  }

  return (
    <Container {...dialogProps}>
      <ContainerTrigger asChild>{children}</ContainerTrigger>
      <ContainerContent>
        <ContainerHeader>
          <ContainerTitle>Cookie Preferences</ContainerTitle>
        </ContainerHeader>
        <div
          className={cn('space-y-6', {
            'px-8': isMobile,
            'pb-8': isMobile,
          })}
        >
          <p className="text-xs sm:text-sm">
            When you visit our website, we may store cookies on your browser to ensure the basic
            functionalities of the website, ensure your security, and to enhance your online
            experience, by helping us better understand user behavior and inform us about which
            parts of our website you have visited. Personal information, such as IP addresses or
            device identifiers, collected from our own and third-party cookies may be disclosed to
            our third-party partners, including our analytics partners. Blocking some types of
            cookies may impact your experience on the site. For more information, visit our Privacy
            Policy.
          </p>
          <CookiePreferencesForm onSubmit={handleManageCookiesSubmit} />
        </div>
      </ContainerContent>
    </Container>
  )
}

function useParentComponent() {
  const isMobile = useIsMobile()

  return React.useMemo(
    () => ({
      isMobile,
      Container: isMobile ? Drawer : Dialog,
      ContainerTrigger: isMobile ? DrawerTrigger : DialogTrigger,
      ContainerContent: isMobile
        ? DrawerContent
        : (props: DialogProps) => (
            <DialogContent a11yTitle="Cookie consent" {...props} className="max-w-lg" />
          ),
      ContainerHeader: isMobile ? DrawerHeader : DialogHeader,
      ContainerTitle: isMobile ? DrawerTitle : DialogTitle,
    }),
    [isMobile],
  )
}
