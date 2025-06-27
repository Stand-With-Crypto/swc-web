import { LoginDialogWrapper } from '@/components/app/authentication/loginDialogWrapper'
import { Button } from '@/components/ui/button'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { StateShield } from '@/components/ui/stateShield'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

interface HeaderShieldProps {
  countryCode: SupportedCountryCodes
  stateCode: string
}

export function Header({ children }: React.PropsWithChildren) {
  return <div className="container mb-16 flex flex-col items-center gap-y-7">{children}</div>
}

function HeaderShield({ countryCode, stateCode }: HeaderShieldProps) {
  return <StateShield countryCode={countryCode} size={150} state={stateCode.toUpperCase()} />
}
Header.Shield = HeaderShield

function HeaderTitle({ children }: React.PropsWithChildren) {
  return <PageTitle>{children}</PageTitle>
}
Header.Title = HeaderTitle

function HeaderSubTitle({ children }: React.PropsWithChildren) {
  return <PageSubTitle>{children}</PageSubTitle>
}
Header.SubTitle = HeaderSubTitle

function HeaderCTA({ children }: React.PropsWithChildren) {
  return (
    <LoginDialogWrapper>
      <Button variant="secondary">{children}</Button>
    </LoginDialogWrapper>
  )
}
Header.CTA = HeaderCTA
