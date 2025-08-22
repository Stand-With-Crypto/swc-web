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
  signaturesCount: number
  goal: number
  className?: string
}

const DEFAULT_INNER_WIDTH = 'mx-auto md:w-[75%] md:min-w-[540px]'

export function PetitionHeader({
  title,
  description,
  petitionSlug,
  signaturesCount,
  goal,
  className,
}: PetitionHeaderProps) {
  const progressPercentage = Math.min((signaturesCount / goal) * 100, 100)
  return (
    <div className={cn('mx-auto w-full', className)}>
      <div className={DEFAULT_INNER_WIDTH}>
        <div className="space-y-4 px-6 py-6 pt-12">
          <PageTitle size="md">{title}</PageTitle>
          <PageSubTitle size="sm">{description}</PageSubTitle>
          <div className="text-center">
            {petitionSlug ? (
              <Link className="underline" href={`/petitions/${petitionSlug}`}>
                View petition
              </Link>
            ) : (
              <span className="underline">View petition</span>
            )}
          </div>
        </div>

        <div className="space-y-2 px-6 pb-6">
          <Progress className="h-4" value={progressPercentage} />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{signaturesCount.toLocaleString()} Signatures</span>
            <span>{goal.toLocaleString()} Goal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface PetitionProgressProps {
  signaturesCount: number
  goal: number
  progressPercentage: number
  className?: string
}

export function PetitionProgress({
  signaturesCount,
  goal,
  progressPercentage,
  className,
}: PetitionProgressProps) {
  return (
    <div className={cn('mx-auto !w-full md:w-[80%] md:min-w-[520px]', className)}>
      <div className="space-y-2 px-6 md:px-12">
        <Progress className="h-4" value={progressPercentage} />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{signaturesCount.toLocaleString()} Signatures</span>
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
    <div className={cn('text-center text-xs text-muted-foreground', className)}>
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
        'fixed bottom-0 left-0 right-0 flex flex-col items-center justify-center gap-4 border-t bg-background px-6 py-8 pt-4 md:pt-6',
        className,
      )}
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) 0px 1px 6px 0px' }}
    >
      <div className={cn(DEFAULT_INNER_WIDTH, 'space-y-4')}>{children}</div>
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

  return (
    <Form {...form}>
      <form
        className="flex h-full flex-col space-y-0 pb-40 max-md:justify-between"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <PetitionHeader
          description={description}
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
          <SubmitSection>
            <PrivacyNotice />
            <Button
              className="h-12 w-full"
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
