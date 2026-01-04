import type { HTMLInputTypeAttribute } from 'react'

import type { FormControlProps } from './form-base'

import { Input } from '../ui/input'
import { FormBase } from './form-base'
import { useFieldContext } from './hooks'

export interface FormInputProps extends FormControlProps {
  type?: HTMLInputTypeAttribute | undefined
}

export function FormInput(props: FormInputProps) {
  const field = useFieldContext<string>()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        type={props.type ?? 'text'}
        value={field.state.value}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        onChange={e => field.handleChange(e.target.value)}
      />
    </FormBase>
  )
}
