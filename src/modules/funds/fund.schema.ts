import { z } from 'zod'

export const CreateFundSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  vintage_year: z.number().int().min(1900).max(2100),
  target_size_usd: z.number().positive('Target size must be positive'),
  status: z.enum(['Fundraising', 'Investing', 'Closed']).default('Fundraising'),
})

export const UpdateFundSchema = z.object({
  name: z.string().min(1).optional(),
  vintage_year: z.number().int().min(1900).max(2100).optional(),
  target_size_usd: z.number().positive().optional(),
  status: z.enum(['Fundraising', 'Investing', 'Closed']).optional(),
})

export type CreateFundDto = z.infer<typeof CreateFundSchema>
export type UpdateFundDto = z.infer<typeof UpdateFundSchema>
