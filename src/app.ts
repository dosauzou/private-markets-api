import 'dotenv/config'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import { requestLogger } from './shared/middleware/logger'
import { errorHandler } from './shared/middleware/error'
import { swaggerDocument } from './swagger'
import healthRoutes from './modules/health/health.routes'
import fundRoutes from './modules/funds/fund.routes'
import investorRoutes from './modules/investors/investor.routes'

const app = express()

app.use(express.json())
app.use(requestLogger)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use('/api/health', healthRoutes)
app.use('/funds', fundRoutes)
app.use('/investors', investorRoutes)

app.use(errorHandler)

export default app
