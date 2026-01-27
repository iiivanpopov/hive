import type { ReactNode } from 'react'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '../ui/field'
import { useFieldContext } from './hooks'

export interface FormControlProps {
  label: string
  description?: string
  error?: { message?: string } | undefined
}

type FormBaseProps = FormControlProps & {
  horizontal?: boolean
  contentPosition?: 'start' | 'end'
  children: ReactNode
}

export function FormBase({
  children,
  label,
  description,
  contentPosition,
  horizontal,
  error,
}: FormBaseProps) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

  const labelElement = (
    <>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
    </>
  )
  const errorElem = isInvalid && <FieldError errors={[error]} />

  return (
    <Field
      data-invalid={isInvalid}
      orientation={horizontal ? 'horizontal' : undefined}
    >
      {contentPosition === 'end'
        ? (
            <>
              {children}
              <FieldContent>
                {labelElement}
                {errorElem}
              </FieldContent>
            </>
          )
        : (
            <>
              <FieldContent>{labelElement}</FieldContent>
              {children}
              {errorElem}
            </>
          )}
    </Field>
  )
}
