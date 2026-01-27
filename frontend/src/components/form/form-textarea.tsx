import type { ComponentProps } from 'react'

import type { OmitFormProps } from '@/components/form/types.ts'

import type { FormControlProps } from './form-base'

import { Textarea } from '../ui/textarea'
import { FormBase } from './form-base'
import { useFieldContext } from './hooks'

export type FormTextareaProps = FormControlProps & OmitFormProps<ComponentProps<'textarea'>>

export function FormTextarea({
  label,
  description,
  error,
  ...props
}: FormTextareaProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase
      label={label}
      description={description}
      error={error}
    >
      <Textarea
        {...props}
        aria-invalid={isInvalid}
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
      />
    </FormBase>
  )
}
