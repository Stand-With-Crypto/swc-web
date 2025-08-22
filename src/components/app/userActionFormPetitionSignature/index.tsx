'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { z } from 'zod'

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
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PageTitle } from '@/components/ui/pageTitleText'
import { Progress } from '@/components/ui/progress'
import { PetitionData } from '@/types/petition'
import { cn } from '@/utils/web/cn'

const signatureFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
})

type SignatureFormData = z.infer<typeof signatureFormSchema>

interface PetitionHeaderProps {
  title: string
  description: string
  petitionSlug?: string
  className?: string
}

export function PetitionHeader({
  title,
  description,
  petitionSlug,
  className,
}: PetitionHeaderProps) {
  return (
    <div className={cn('mx-auto w-full', className)}>
      <div className="mx-auto md:w-[80%] md:min-w-[520px]">
        <div className="space-y-4 px-6 py-6 pt-12 md:px-12">
          <PageTitle size="lg">{title}</PageTitle>
          <PageSubTitle size="md">{description}</PageSubTitle>
          <div className="text-center">
            {petitionSlug ? (
              <Link className="underline" href={`/petitions/${petitionSlug}`}>
                View details
              </Link>
            ) : (
              <span className="underline">View details</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface PetitionProgressProps {
  signatures: number
  goal: number
  progressPercentage: number
  className?: string
}

export function PetitionProgress({
  signatures,
  goal,
  progressPercentage,
  className,
}: PetitionProgressProps) {
  return (
    <div className={cn('mx-auto !w-full md:w-[80%] md:min-w-[520px]', className)}>
      <div className="space-y-2 px-6 md:px-12">
        <Progress className="h-4" value={progressPercentage} />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{signatures.toLocaleString()} Signatures</span>
          <span>{goal.toLocaleString()} Goal</span>
        </div>
      </div>
    </div>
  )
}

interface FormContainerProps {
  children: React.ReactNode
  className?: string
}

export function FormContainer({ children, className }: FormContainerProps) {
  return (
    <div className={cn('space-y-4 px-6 py-8 md:space-y-8 md:px-12', className)}>{children}</div>
  )
}

interface PrivacyNoticeProps {
  className?: string
}

export function PrivacyNotice({ className }: PrivacyNoticeProps) {
  return (
    <div className={cn('px-6 py-4 text-sm text-muted-foreground md:px-12', className)}>
      By submitting, I understand that Stand With Crypto and its vendors may collect and use my
      personal information subject to the{' '}
      <Link className="underline" href="/privacy" target="_blank">
        SWC Privacy Policy
      </Link>
      .
    </div>
  )
}

interface SubmitSectionProps {
  children: React.ReactNode
  className?: string
}

export function SubmitSection({ children, className }: SubmitSectionProps) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 flex items-center justify-center gap-4 border-t bg-background px-6 py-8 md:px-12',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface UserActionFormPetitionSignatureProps {
  onSuccess?: () => void
  petitionData: PetitionData
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

  const { title, description, countSignaturesGoal, signaturesCount } = petitionData

  const onSubmit = (data: SignatureFormData) => {
    console.log('Petition signed with data:', data)
    onSuccess?.()
  }

  const progressPercentage = Math.min((signaturesCount / countSignaturesGoal) * 100, 100)

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col space-y-0 pb-28 max-md:justify-between"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PetitionHeader description={description} petitionSlug={petitionData.slug} title={title} />

        <PetitionProgress
          goal={countSignaturesGoal}
          progressPercentage={progressPercentage}
          signatures={signaturesCount}
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
          <PrivacyNotice />

          <SubmitSection>
            <Button
              className="h-12 w-full md:w-[75%]"
              disabled={form.formState.isSubmitting}
              size="default"
              type="submit"
            >
              Sign
            </Button>
          </SubmitSection>
        </div>
      </form>
    </Form>
  )
}
