'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormErrorMessage,
  FormGeneralErrorMessage,
  FormSuccessMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { zodEmailYourCongressperson } from '@/validation/zodEmailYourCongressperson'
import { triggerEmailYourCongressPerson } from '@/actions/sampleArchitecture/triggerEmailYourCongressPerson'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'

const DEFAULT_MESSAGE = `The House Financial Services Committee and the House Agriculture Committee in the U.S. House of Representatives passed historic, bipartisan legislation in July. I am asking you to support the bill when it comes to the floor for a full House vote.

The Financial Innovation and Technology for the 21st Century Act ("FIT21") addresses a pressing need for regulatory clarity in the United States for crypto. A vote for this bill is a vote to protect customers, promote job opportunities, and bolster national security.

As your constituent, I am asking you to vote for FIT21 to safeguard consumers and promote responsible innovation. Thank you.`

const FORM_NAME = 'Email Your Congressperson'
type FormValues = z.infer<typeof zodEmailYourCongressperson> & GenericErrorFormValues

export default function FormEmailYourCongressperson() {
  const form = useForm<FormValues>({
    resolver: zodResolver(zodEmailYourCongressperson),
    defaultValues: {
      // added sample data to just make testing easier
      fullName: 'Test User',
      zipCode: '10025',
      email: 'helloworld@foobar.com',
      phoneNumber: '2032224453',
      address: '110 Old Drive, CT',
      message: DEFAULT_MESSAGE,
    },
  })
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(values =>
          triggerServerActionForForm({ form, formName: FORM_NAME }, () =>
            triggerEmailYourCongressPerson(values),
          ),
        )}
        className="space-y-8"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
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
                <FormLabel>Zip</FormLabel>
                <FormControl>
                  <Input placeholder="00000" {...field} />
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
                  <Input placeholder="Your email" {...field} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone number</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} />
                </FormControl>
                <FormErrorMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="423 Stanley Avenue" {...field} />
              </FormControl>
              <FormErrorMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea rows={10} placeholder="423 Stanley Avenue" {...field} />
              </FormControl>
              <FormErrorMessage />
            </FormItem>
          )}
        />
        <FormGeneralErrorMessage control={form.control} />
        {form.formState.isSubmitSuccessful && <FormSuccessMessage>Great work!</FormSuccessMessage>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
