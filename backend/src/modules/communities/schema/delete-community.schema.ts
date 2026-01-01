import z from 'zod'

export const DeleteCommunityParamSchema = z.object({
  id: z.coerce.number(),
})

export type DeleteCommunityParam = z.infer<typeof DeleteCommunityParamSchema>
