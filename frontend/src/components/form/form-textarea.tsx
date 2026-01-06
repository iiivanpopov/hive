import type { FormControlProps } from './form-base'

import { Textarea } from '../ui/textarea'
import { FormBase } from './form-base'
import { useFieldContext } from './hooks'

export interface FormTextareaProps extends FormControlProps {
}

export function FormTextarea({
  label,
  description,
  error,
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
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        aria-invalid={isInvalid}
        onChange={e => field.handleChange(e.target.value)}
      />
    </FormBase>
  )
}
