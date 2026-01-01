import z from 'zod'

export const EmailSchema = z.email().trim().toLowerCase()
export const IsoDateTimeSchema = z.iso.datetime()
export const IdSchema = z.coerce.number().int().positive()
