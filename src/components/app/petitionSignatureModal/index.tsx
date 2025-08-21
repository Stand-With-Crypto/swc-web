'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

const signatureFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  zipCode: z.string().min(5, 'Please enter a valid zip code'),
})

type SignatureFormData = z.infer<typeof signatureFormSchema>

export interface UserActionFormPetitionSignatureProps {
  title: string
  description: string
  goal: number
  signatures: number
  onClose: () => void
  onSuccess?: () => void
}

export function UserActionFormPetitionSignature({
  title,
  description,
  goal,
  signatures,
  onClose,
  onSuccess,
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

  const onSubmit = (data: SignatureFormData) => {
    console.log('Petition signed with data:', data)
    onSuccess?.()
  }

  const progressPercentage = Math.min((signatures / goal) * 100, 100)

  return (
    <div className="space-y-6 px-4 md:px-6">
      <div className="text-center">
        <PageTitle className="mb-2" size="md">
          {title}
        </PageTitle>
        <PageSubTitle className="mb-6" size="md">
          {description}
        </PageSubTitle>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{signatures.toLocaleString()} Signatures</span>
          <span>{goal.toLocaleString()} Goal</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="text-center">
          <button className="text-sm text-blue-600 hover:underline">More info</button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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

          <div className="flex gap-4">
            <Button className="flex-1" onClick={onClose} type="button" variant="outline">
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={form.formState.isSubmitting}
              size="lg"
              type="submit"
            >
              Sign
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
