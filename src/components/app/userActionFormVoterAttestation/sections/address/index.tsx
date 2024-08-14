'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { UserActionFormLayout } from '@/components/app/userActionFormCommon/layout'
import type { VoterAttestationActionSharedData } from '@/components/app/userActionFormVoterAttestation'
import { FormFields } from '@/components/app/userActionFormVoterAttestation/types'
import { Button } from '@/components/ui/button'
import { ErrorMessage } from '@/components/ui/errorMessage'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { GooglePlacesSelect } from '@/components/ui/googlePlacesSelect'
import { InternalLink } from '@/components/ui/link'
import { useIntlUrls } from '@/hooks/useIntlUrls'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/utils/web/cn'
import { trackFormSubmissionSyncErrors } from '@/utils/web/formUtils'

import {
  findVoterAttestationFormValidationSchema,
  type FindVoterAttestationFormValues,
  FORM_NAME,
  getDefaultValues,
} from './formConfig'

export interface AddressProps
  extends Pick<VoterAttestationActionSharedData, 'user' | 'onFindAddress' | 'goBackSection'> {
  initialValues?: FormFields
  heading?: React.ReactNode
  submitButtonText?: string
  error?: string
  isLoading?: boolean
}

export function Address({
  user,
  goBackSection,
  onFindAddress,
  initialValues,
  heading = <UserActionFormLayout.Heading title={"Check who's on the ballot and pledge to vote"} />,
  submitButtonText = 'Continue',
  error,
  isLoading,
}: AddressProps) {
  const urls = useIntlUrls()
  const userDefaultValues = useMemo(() => getDefaultValues({ user }), [user])

  const form = useForm<FindVoterAttestationFormValues>({
    defaultValues: {
      ...userDefaultValues,
      address: initialValues?.address || userDefaultValues.address,
    },
    resolver: zodResolver(findVoterAttestationFormValidationSchema),
  })

  const isMobile = useIsMobile({ defaultState: true })
  const inputRef = useRef<HTMLInputElement | null>(null)
  const errorRef = useRef(error)
  errorRef.current = error
  useEffect(() => {
    if (!isMobile && !errorRef.current) {
      inputRef.current?.click()
    }
  }, [form, isMobile])

  const address = useWatch({
    control: form.control,
    name: 'address',
  })

  return (
    <Form {...form}>
      <form
        className="max-md:h-full"
        onSubmit={form.handleSubmit(data => {
          onFindAddress(data.address)
        }, trackFormSubmissionSyncErrors(FORM_NAME))}
      >
        <UserActionFormLayout onBack={goBackSection}>
          <UserActionFormLayout.Container>
            {heading}

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(!!error && 'text-destructive')}>Address</FormLabel>
                  <FormControl aria-invalid={!!error}>
                    <GooglePlacesSelect
                      {...field}
                      onChange={newAddress => {
                        onFindAddress(newAddress)
                        field.onChange(newAddress)
                      }}
                      placeholder="Your full address"
                      ref={inputRef}
                      value={field.value}
                    />
                  </FormControl>
                  {!!error && <ErrorMessage>{error}</ErrorMessage>}
                </FormItem>
              )}
            />
          </UserActionFormLayout.Container>
          <UserActionFormLayout.Footer>
            <Button disabled={!address || !!error || isLoading} type="submit">
              {form.formState.isSubmitting || isLoading ? 'Loading...' : submitButtonText}
            </Button>

            <p className="text-sm">
              Learn more about our{' '}
              <InternalLink className="underline" href={urls.privacyPolicy()} tabIndex={-1}>
                privacy policy
              </InternalLink>
            </p>
          </UserActionFormLayout.Footer>
        </UserActionFormLayout>
      </form>
    </Form>
  )
}
