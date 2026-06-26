import { Request, Response, NextFunction } from 'express'
import { FundService } from './fund.service'
import { CreateFundSchema, UpdateFundSchema } from './fund.schema'

const fundService = new FundService()

export async function getAllFunds(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fundService.findAll()
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

export async function getFundById(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fundService.findById(req.params.id)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

export async function createFund(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateFundSchema.parse(req.body)
    const data = await fundService.create(body)
    res.status(201).json({ success: true, data })
  } catch (e) { next(e) }
}

export async function updateFund(req: Request, res: Response, next: NextFunction) {
  try {
    const body = UpdateFundSchema.parse(req.body)
    const data = await fundService.update(req.params.id, body)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}
