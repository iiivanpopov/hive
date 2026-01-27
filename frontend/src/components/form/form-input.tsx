import type { ComponentProps } from 'react'

import type { OmitFormProps } from '@/components/form/types.ts'

import type { FormControlProps } from './form-base'

import { Input } from '../ui/input'
import { FormBase } from './form-base'
import { useFieldContext } from './hooks'

export type FormInputProps = FormControlProps & OmitFormProps<ComponentProps<'input'>>

export function FormInput({
  label,
  description,
  error,
  ...props
}: FormInputProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase
      label={label}
      description={description}
      error={error}
    >
      <Input
        {...props}
        id={field.name}
        aria-invalid={isInvalid}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={e => field.handleChange(e.target.value)}
      />
    </FormBase>
  )
}
