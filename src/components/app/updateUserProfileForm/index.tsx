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
import { zodUpdateUserProfile } from '@/validation/zodUpdateUserProfile'
import { triggerEmailYourCongressPerson } from '@/actions/sampleArchitecture/triggerEmailYourCongressPerson'
import { GenericErrorFormValues, triggerServerActionForForm } from '@/utils/web/formUtils'
import { PageTitle } from '@/components/ui/pageTitleText'
import { PageSubTitle } from '@/components/ui/pageSubTitle'
import { PlacesAutocomplete } from '@/components/ui/googlePlacesSelect'

const FORM_NAME = 'User Profile'
type FormValues = z.infer<typeof zodUpdateUserProfile> & GenericErrorFormValues

export function UpdateUserProfileForm({ defaultValues }: { defaultValues: FormValues }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(zodUpdateUserProfile),
    defaultValues,
  })
  return (
    <div>
      <PageTitle size="sm" className="mb-3">
        Finish your profile
      </PageTitle>
      <PageSubTitle className="mb-7">
        Completing your profile makes it easier for you to take action, locate your representative
        and find local events. Stand With Crypto will never share your data with any third-parties.
      </PageSubTitle>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(values => {
            // return triggerServerActionForForm({ form, formName: FORM_NAME }, () =>
            //   triggerEmailYourCongressPerson(values),
            // )
          })}
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <PlacesAutocomplete {...field} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormErrorMessage />
                </FormItem>
              )}
            />
          </div>
          <FormGeneralErrorMessage control={form.control} />
          {form.formState.isSubmitSuccessful && (
            <FormSuccessMessage>Great work!</FormSuccessMessage>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}
