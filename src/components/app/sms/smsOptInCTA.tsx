'use client'

import { SMSOptInForm, SMSOptInFormProps } from '@/components/app/sms/smsOptInForm'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'

type SMSOptInProps = Omit<SMSOptInFormProps, 'children'> & {
  className?: string
  darkMode?: boolean
}

export function SMSOptInCTA({ className, darkMode, ...props }: SMSOptInProps) {
  const isMobile = useIsMobile()

  const variant = darkMode ? 'muted' : 'default'

  return (
    <SMSOptInForm {...props}>
      {({ form }) => (
        <div className={cn('space-y-2', className)}>
          {isMobile ? (
            <div className="flex flex-row flex-wrap items-center justify-center gap-4">
              <SMSOptInForm.PhoneNumberField
                className={cn('flex-1', {
                  'text-muted-foreground': darkMode,
                })}
              />

              <SMSOptInForm.Footnote variant={variant} />

              <SMSOptInForm.SubmitButton
                className="flex-0 self-start"
                disabled={form.formState.isSubmitting}
                size="default"
                variant="primary-cta"
              />
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <SMSOptInForm.PhoneNumberField
                  className={cn('flex-1', {
                    'text-muted-foreground': darkMode,
                  })}
                />

                <SMSOptInForm.SubmitButton
                  className="flex-0 self-start rounded-md"
                  disabled={form.formState.isSubmitting}
                  size="lg"
                  variant="primary-cta"
                />
              </div>

              <SMSOptInForm.Footnote textAlign="left" variant={variant} />
            </>
          )}
        </div>
      )}
    </SMSOptInForm>
  )
}
