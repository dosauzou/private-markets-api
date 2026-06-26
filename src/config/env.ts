import { z } from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z
    .preprocess((value) => {
      if (typeof value === 'string' && value.length > 0) {
        return value
      }

      return ''
    },
    z.string()
      .min(1, 'DATABASE_URL is required')
      .refine((value) => /^(postgres(ql)?:\/\/)/.test(value), 'DATABASE_URL must be a PostgreSQL connection string')),
  PORT: z
    .preprocess((value) => {
      if (typeof value === 'string') return Number(value)
      return value
    }, z.number().int().positive().default(3000)),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
})

export type Env = z.infer<typeof EnvSchema>
export const env = EnvSchema.parse(process.env)
