'use client'

import * as React from 'react'
import {
  Control,
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from 'react-hook-form'
import * as LabelPrimitive from '@radix-ui/react-label'
import { Slot } from '@radix-ui/react-slot'

import { ErrorMessage } from '@/components/ui/errorMessage'
import { Label } from '@/components/ui/label'
import { cn } from '@/utils/web/cn'
import { GENERIC_FORM_ERROR_KEY } from '@/utils/web/formUtils'

const Form = FormProvider

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  render,
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller
        {...props}
        render={({ field, ...renderProps }) => {
          /*
          There is a super bizarre tab focus bug. If we render a react-hook-form in a radix dialog modal, and try to tab through the inputs,
          we'll get a really weird behavior where the first time you try to tab over to an input, the tab will reset to the dialog, but the second time it works.
          I've confirmed:
          - This behavior doesn't existing when using a react-hook-form outside of a radix dialog modal
          - It only occurs if "onBlur" is allowed to be triggered on the input

          This is an ugly hack to prevent it from occurring. If you can solve the problem, we can delete this overrides.
          */
          return render({ ...renderProps, field: { ...field, onBlur: () => {} } })
        }}
      />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

interface FormItemContextValue {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue)

const FormItemSkeleton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div className={cn('space-y-2', className)} ref={ref} {...props} />
  },
)
FormItemSkeleton.displayName = 'FormItemSkeleton'
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <FormItemSkeleton className={className} ref={ref} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = 'FormItem'

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn(error && 'text-destructive', className)}
      htmlFor={formItemId}
      ref={ref}
      {...props}
    />
  )
})
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<
  React.ComponentRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      id={formItemId}
      ref={ref}
      {...props}
    />
  )
})
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      id={formDescriptionId}
      ref={ref}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

const FormErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <ErrorMessage className={className} id={formMessageId} ref={ref} {...props}>
      {body}
    </ErrorMessage>
  )
})
FormErrorMessage.displayName = 'FormErrorMessage'

const FormSuccessMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return <p className={cn('text-sm font-medium text-primary', className)} ref={ref} {...props} />
})
FormSuccessMessage.displayName = 'FormSuccessMessage'

const FormGeneralErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    control: Control<any>
  }
>(({ className: _className, children: _children, control, ...props }, ref) => {
  return (
    <FormField
      control={control}
      name={GENERIC_FORM_ERROR_KEY}
      render={() => <FormErrorMessage {...props} ref={ref} />}
    />
  )
})
FormGeneralErrorMessage.displayName = 'FormMessage'

export {
  Form,
  FormControl,
  FormDescription,
  FormErrorMessage,
  FormField,
  FormGeneralErrorMessage,
  FormItem,
  FormItemSkeleton,
  FormLabel,
  FormSuccessMessage,
  useFormField,
}
