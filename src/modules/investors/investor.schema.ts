import { z } from 'zod'

export const CreateInvestorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  investor_type: z.enum(['Individual', 'Institution', 'FamilyOffice']),
})

export type CreateInvestorDto = z.infer<typeof CreateInvestorSchema>
