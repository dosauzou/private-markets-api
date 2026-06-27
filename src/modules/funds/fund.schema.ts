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

export const FundListQuerySchema = z.object({
  page: z.preprocess((value) => {
    if (value === undefined || value === '') return undefined
    if (typeof value === 'string') return Number(value)
    return value
  }, z.number().int().positive().default(1)),
  limit: z.preprocess((value) => {
    if (typeof value === 'string' && value.length) return Number(value)
    return undefined
  }, z.number().int().positive().max(100).default(20)),
  status: z.enum(['Fundraising', 'Investing', 'Closed']).optional(),
  vintage_year: z.preprocess((value) => {
    if (typeof value === 'string' && value.length) return Number(value)
    return undefined
  }, z.number().int().min(1900).max(2100).optional()),
  search: z.string().trim().min(1).optional(),
})

export type CreateFundDto = z.infer<typeof CreateFundSchema>
export type UpdateFundDto = z.infer<typeof UpdateFundSchema>
export type FundListQueryDto = z.infer<typeof FundListQuerySchema>
