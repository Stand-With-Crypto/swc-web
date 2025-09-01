'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { PrivacyNotice } from '@/components/app/userActionFormPetitionSignature/privacyNotice'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormErrorMessage,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SWCPetition } from '@/utils/shared/zod/getSWCPetitions'

import { FormContainer } from './container'
import { Footer } from './footer'
import { PetitionHeader } from './header'

const signatureFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
})

type SignatureFormData = z.infer<typeof signatureFormSchema>

interface UserActionFormPetitionSignatureProps {
  onSuccess?: () => void
  petitionData: SWCPetition
}

export function UserActionFormPetitionSignature({
  onSuccess,
  petitionData,
}: UserActionFormPetitionSignatureProps) {
  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      zipCode: '',
    },
  })

  const { title, countSignaturesGoal, signaturesCount } = petitionData

  const onSubmit = (data: SignatureFormData) => {
    console.log('Petition signed with data:', data)
    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col space-y-0 pb-40 max-md:justify-between"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PetitionHeader
          goal={countSignaturesGoal}
          petitionSlug={petitionData.slug}
          signaturesCount={signaturesCount}
          title={title}
        />

        <FormContainer>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your first name" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your last name" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Your email address" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip code</FormLabel>
                  <FormControl>
                    <Input placeholder="000000" {...field} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>
        </FormContainer>

        <div>
          <Footer>
            <PrivacyNotice />
            <Button
              className="h-12 w-full"
              disabled={form.formState.isSubmitting || !form.formState.isValid}
              size="default"
              type="submit"
            >
              Sign
            </Button>
          </Footer>
        </div>
      </form>
    </Form>
  )
}
