import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { FormInput } from './form-input'
import { FormTextarea } from './form-textarea'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

const { useAppForm: useForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
    Textarea: FormTextarea,
  },
  formComponents: {

  },
  fieldContext,
  formContext,
})

export { useFieldContext, useForm, useFormContext }
