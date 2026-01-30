import z from 'zod'

export const EmailSchema = z
  .email('validation.email.invalid')
  .trim()
  .toLowerCase()
