'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { submitQuestionnaireAnswers } from '@/actions/questionnaire/submitAnswers'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { BuilderFormConfig } from '@/data/questionnaire/getBuilderForm'
import { SupportedCountryCodes } from '@/utils/shared/supportedCountries'

export function DynamicQuestionnaireForm({
  config,
  selectedFormKey,
  countryCode,
  onSubmitted,
}: {
  config: BuilderFormConfig
  selectedFormKey: string
  countryCode: SupportedCountryCodes
  onSubmitted?: () => void
}) {
  const selected = useMemo(
    () => config.formTypes.find(v => v.key === selectedFormKey),
    [config.formTypes, selectedFormKey],
  )

  const form = useForm<{
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    company: string
    stateAndDistrict: string
    answers: Record<string, boolean | string>
  }>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      company: '',
      stateAndDistrict: '',
      answers: Object.fromEntries(
        (selected?.questions || []).map(q => [q.key, q.type === 'text' ? '' : false]),
      ),
    },
  })

  if (!selected) return null

  const handleSubmit = form.handleSubmit(async values => {
    toast.loading('Submitting...')

    const res = await submitQuestionnaireAnswers({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phoneNumber: values.phoneNumber,
      company: values.company,
      stateAndDistrict: values.stateAndDistrict,
      countryCode: countryCode,
      formType: selectedFormKey,
      answers: values.answers,
    })

    if ((res as any)?.success) {
      toast.success('Submitted')
      onSubmitted?.()
    } else if ((res as any)?.error) {
      toast.error('Submission failed')
    }
  })

  const { isSubmitting } = form.formState

  return (
    <Form {...form}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Global fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={'firstName'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="First name" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'lastName'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="Last name" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={'email'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="Email" type="email" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'phoneNumber'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="Phone number" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={'company'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="Company" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={'stateAndDistrict'}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} disabled={isSubmitting} placeholder="State and District" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {selected.questions.map(q => (
          <FormField
            control={form.control}
            key={q.key}
            name={`answers.${q.key}` as const}
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                {q.type === 'boolean' ? (
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1">{q.label}</span>
                    <FormControl>
                      <Select
                        onValueChange={v => onChange(v === 'yes')}
                        value={value ? 'yes' : 'no'}
                      >
                        <SelectTrigger className="w-[140px]" disabled={isSubmitting}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <span className="min-w-0 flex-1">{q.label}</span>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        onChange={onChange}
                        value={(value as string) || ''}
                      />
                    </FormControl>
                  </div>
                )}
              </FormItem>
            )}
          />
        ))}

        <Button className="mt-2" disabled={isSubmitting} size="lg" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
