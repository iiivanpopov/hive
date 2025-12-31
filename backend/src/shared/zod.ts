import z from 'zod'

export const EmailSchema = z.email().trim().toLowerCase()
