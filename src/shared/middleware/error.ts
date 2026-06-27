import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: err.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    })
    return
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message

  const shouldLogError =
    process.env.NODE_ENV !== 'production' &&
    (!(err instanceof AppError) || err.statusCode >= 500)

  if (shouldLogError) {
    console.error('[Error]', err)
  }

  res.status(statusCode).json({ success: false, error: message })
}
