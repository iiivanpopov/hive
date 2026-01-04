import z from 'zod'

export const EmailSchema = z.email().trim().toLowerCase()
export const IdSchema = z.coerce.number().int().positive()
