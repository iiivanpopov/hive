import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { FormInput } from './form-input'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

const { useAppForm: useForm } = createFormHook({
  fieldComponents: {
    Input: FormInput,
  },
  formComponents: {

  },
  fieldContext,
  formContext,
})

export { useFieldContext, useForm, useFormContext }
