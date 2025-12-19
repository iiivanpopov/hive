import z from 'zod'

export const RegisterBodySchema = z.object({
  username: z.string().min(5),
  email: z.email(),
  password: z.string().min(6),
})

export type RegisterBody = z.infer<typeof RegisterBodySchema>

export const RegisterResponseSchema = z.object({
  sessionToken: z.string(),
})

export type RegisterResponse = z.infer<typeof RegisterResponseSchema>
