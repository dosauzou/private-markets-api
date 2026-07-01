import { Router } from 'express'
import { getAllFunds, getFundById, createFund, updateFund } from './fund.controller'

const router = Router()

router.get('/', getAllFunds)
router.get('/:id', getFundById)
router.post('/', createFund)
router.put('/', updateFund)

export default router
