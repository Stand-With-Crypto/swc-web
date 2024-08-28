import React, { useMemo } from 'react'
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
import { InternalLink } from '@/components/ui/link'
import { useDialog } from '@/hooks/useDialog'
import { useIsMobile } from '@/hooks/useIsMobile'
import { SupportedLocale } from '@/intl/locales'
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

import { CookiePreferencesForm } from './cookiePreferencesForm'

interface ManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
  locale: SupportedLocale
}

export default function ManageCookiesModal({
  children,
  onSubmit,
  locale,
}: ManageCookiesModalProps) {
  const urls = useMemo(() => getIntlUrls(locale), [locale])
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
        <ContainerHeader
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <ContainerTitle className="text-left">Privacy Choices</ContainerTitle>
        </ContainerHeader>
        <div
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <p className="text-xs sm:text-sm">
            We may engage in remarketing campaigns. This is a type of online advertising that
            directs advertising to individuals that have previously interacted with us. To opt-out
            of the use of your personal data for our remarketing campaigns, please email us at:{' '}
            <a className="underline" href="mailto:info@standwithcrypto.org">
              info@standwithcrypto.org
            </a>
          </p>
        </div>
        <ContainerHeader
          className={cn('space-y-6 px-0 pb-4', {
            'px-8': isMobile,
          })}
        >
          <ContainerTitle className="text-left">Cookie Preferences</ContainerTitle>
        </ContainerHeader>
        <div
          className={cn('space-y-6 px-0 pb-0', {
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
            our third-party partners, including our analytics and marketing partners. Blocking some
            types of cookies may impact your experience on the site. For more information, visit our{' '}
            <InternalLink className="underline" href={urls.privacyPolicy()}>
              Privacy Policy
            </InternalLink>
            .
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
