import { z } from 'zod'

export const CreateInvestmentSchema = z.object({
  investor_id: z.string().uuid('investor_id must be a valid UUID'),
  amount_usd: z.number().positive('Amount must be positive'),
  investment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export type CreateInvestmentDto = z.infer<typeof CreateInvestmentSchema>
