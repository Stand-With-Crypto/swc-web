import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckboxProps } from '@radix-ui/react-checkbox'
import { z } from 'zod'

import { zodManageCookieConsent } from '@/components/app/cookieConsent/common/cookieConsentSchema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { InfoBadge } from '@/components/ui/infoBadge'
import { CookieConsentPermissions, OptionalCookieConsentTypes } from '@/utils/shared/cookieConsent'
import { createI18nMessages } from '@/utils/shared/i18n/createI18nMessages'
import { GenericErrorFormValues } from '@/utils/web/formUtils'
import { useTranslation } from '@/utils/web/i18n/useTranslation'

export interface CookiePreferencesFieldConfig {
  key: OptionalCookieConsentTypes
  label: string
  helpText: string
}

interface CookiePreferencesFormProps {
  onSubmit: (accepted: CookieConsentPermissions) => void
  defaultValues: CookieConsentPermissions
  fieldsConfig: CookiePreferencesFieldConfig[]
}

type FormValues = z.infer<typeof zodManageCookieConsent> & GenericErrorFormValues

export const i18nMessages = createI18nMessages({
  defaultMessages: {
    en: {
      manageCookies: 'Manage Cookies:',
      helperText:
        'These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in or filling in forms. These also include cookies we may rely on for fraud prevention. You can set your browser to block or alert you about these cookies, but some parts of the site will not then work.',
      strictlyNecessaryCookies: 'Strictly necessary Cookies',
      save: 'Save',
    },
    de: {
      manageCookies: 'Cookies verwalten:',
      helperText:
        'Diese Cookies sind für die Website erforderlich und können in unseren Systemen nicht abgeschaltet werden. Sie werden normalerweise nur gesetzt, wenn Sie eine Anfrage für Dienste stellen, wie z.B. die Einstellung Ihrer Datenschutzeinstellungen, das Anmelden oder das Ausfüllen von Formularen. Diese Cookies beinhalten auch Cookies, auf die wir für die Betrugsprävention vertrauen. Sie können Ihren Browser so einstellen, dass Sie über diese Cookies informiert werden oder diese blockieren, aber einige Teile der Website funktionieren dann nicht mehr.',
      strictlyNecessaryCookies: 'Strictly necessary Cookies',
      save: 'Speichern',
    },
    fr: {
      manageCookies: 'Gérer les cookies:',
      helperText:
        'Ces cookies sont nécessaires pour que le site fonctionne et ne peuvent pas être désactivés dans nos systèmes. Ils sont généralement définis en réponse à des actions effectuées par vous, qui représentent une demande de services, comme la configuration de vos préférences de confidentialité, la connexion ou le remplissage de formulaires. Ces cookies incluent également les cookies sur lesquels nous pouvons compter pour la prévention du fraude. Vous pouvez configurer votre navigateur pour bloquer ou vous informer sur ces cookies, mais certaines parties du site ne fonctionneront pas alors.',
      strictlyNecessaryCookies: 'Strictly necessary Cookies',
      save: 'Enregistrer',
    },
  },
})

export function CookiePreferencesForm({
  onSubmit,
  defaultValues,
  fieldsConfig,
}: CookiePreferencesFormProps) {
  const { t } = useTranslation(i18nMessages, 'CookiePreferencesForm')

  const form = useForm<FormValues>({
    resolver: zodResolver(zodManageCookieConsent),
    defaultValues,
  })

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <h3 className="font-semibold">{t('manageCookies')}</h3>

        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-[repeat(2,minmax(max-content,1fr))] md:gap-5 md:text-base">
          <CheckboxField
            checked
            disabled
            helpText={t('helperText')}
            label={t('strictlyNecessaryCookies')}
          />

          {fieldsConfig.map(({ key, label, helpText }) => (
            <FormField
              control={form.control}
              key={key}
              name={key}
              render={({ field: { value, onChange, ...field } }) => (
                <CheckboxField
                  helpText={helpText}
                  label={label}
                  {...field}
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
          ))}
        </div>

        <Button className="mt-4 w-full" size="lg" type="submit">
          {t('save')}
        </Button>
      </form>
    </Form>
  )
}

interface CheckboxFieldProps extends CheckboxProps {
  label: string
  helpText: string
}

const CheckboxField = React.forwardRef<React.ComponentRef<typeof FormItem>, CheckboxFieldProps>(
  ({ label, helpText, ...props }, ref) => {
    return (
      <FormItem ref={ref}>
        <label className="flex cursor-pointer items-center gap-2">
          <FormControl>
            <Checkbox {...props} />
          </FormControl>
          <p>{label}</p>
          <InfoBadge analytics={'Cookie Preferences Info Badge'}>{helpText}</InfoBadge>
        </label>
      </FormItem>
    )
  },
)
CheckboxField.displayName = 'CheckboxField'
