import { Router } from 'express'
import { getAllInvestors, createInvestor } from './investor.controller'

const router = Router()

router.get('/', getAllInvestors)
router.post('/', createInvestor)

export default router
