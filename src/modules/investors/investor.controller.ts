import { Request, Response, NextFunction } from 'express'
import { InvestorService } from './investor.service'
import { CreateInvestorSchema } from './investor.schema'

const investorService = new InvestorService()

export async function getAllInvestors(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await investorService.findAll()
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

export async function createInvestor(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateInvestorSchema.parse(req.body)
    const data = await investorService.create(body)
    res.status(201).json({ success: true, data })
  } catch (e) { next(e) }
}
