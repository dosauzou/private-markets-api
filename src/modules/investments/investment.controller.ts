import { Request, Response, NextFunction } from 'express'
import { InvestmentService } from './investment.service'
import { CreateInvestmentSchema } from './investment.schema'

const investmentService = new InvestmentService()

export async function getInvestmentsByFund(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await investmentService.findAllByFund(req.params.fund_id)
    res.json({ success: true, data })
  } catch (e) { next(e) }
}

export async function createInvestment(req: Request, res: Response, next: NextFunction) {
  try {
    const body = CreateInvestmentSchema.parse(req.body)
    const data = await investmentService.create(req.params.fund_id, body)
    res.status(201).json({ success: true, data })
  } catch (e) { next(e) }
}
