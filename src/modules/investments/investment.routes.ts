import { Router } from 'express'
import { getInvestmentsByFund, createInvestment } from './investment.controller'

const router = Router({ mergeParams: true })

router.get('/', getInvestmentsByFund)
router.post('/', createInvestment)

export default router
