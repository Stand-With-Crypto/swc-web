import React, { useMemo } from 'react'
import { DialogProps } from '@radix-ui/react-dialog'

import {
  CookiePreferencesFieldConfig,
  CookiePreferencesForm,
} from '@/components/app/cookieConsent/common/cookiePreferencesForm'
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
import { CookieConsentPermissions } from '@/utils/shared/cookieConsent'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'
import { getIntlUrls } from '@/utils/shared/urls'
import { cn } from '@/utils/web/cn'

interface ManageCookiesModalProps {
  children: React.ReactNode
  onSubmit: (accepted: CookieConsentPermissions) => void
  countryCode: SupportedCountryCodes
  defaultValues: CookieConsentPermissions
  fieldsConfig: CookiePreferencesFieldConfig[]
}

export function ManageCookiesModal({
  children,
  onSubmit,
  countryCode,
  defaultValues,
  fieldsConfig,
}: ManageCookiesModalProps) {
  const urls = useMemo(() => getIntlUrls(countryCode), [countryCode])
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
      <ContainerContent a11yTitle="Privacy Choices">
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
            of the use of your personal data for our remarketing campaigns, please email{' '}
            <a className="text-primary-cta underline" href="mailto:info@standwithcrypto.org">
              info@standwithcrypto.org
            </a>{' '}
            if you live in the USA, or{' '}
            <a className="text-primary-cta underline" href="mailto:info@swcinternational.org">
              info@swcinternational.org
            </a>{' '}
            if you live outside the USA.
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

          <CookiePreferencesForm
            defaultValues={defaultValues}
            fieldsConfig={fieldsConfig}
            onSubmit={handleManageCookiesSubmit}
          />
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
