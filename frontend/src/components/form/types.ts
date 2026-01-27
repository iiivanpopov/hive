export type OmitFormProps<T> = Omit<T, 'id' | 'value' | 'onBlur' | 'onChange' | 'aria-invalid'>
