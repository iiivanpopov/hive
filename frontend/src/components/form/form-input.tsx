import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from 'react'

import type { FormControlProps } from './form-base'

import { Input } from '../ui/input'
import { FormBase } from './form-base'
import { useFieldContext } from './hooks'

export interface FormInputProps extends FormControlProps {
  type?: HTMLInputTypeAttribute | undefined
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined
}

export function FormInput({
  label,
  autoComplete,
  description,
  error,
  type,
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
        id={field.name}
        type={type ?? 'text'}
        value={field.state.value}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        autoComplete={autoComplete}
        onChange={e => field.handleChange(e.target.value)}
      />
    </FormBase>
  )
}
