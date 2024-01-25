import express from 'express'
import 'express-async-errors'

import { fileOwnerRoutes } from './routes/file-owner.js'
import { leaderRoutes } from './routes/leader.js'
import { writeRoute } from './routes/write.js'
import { electionRoutes } from './routes/election.js'

import { IS_FILE_OWNER } from './config/global.js'

const app = express()

app.use(express.json())

if (IS_FILE_OWNER) {
  app.use(fileOwnerRoutes)
}

app.use(leaderRoutes)
app.use(writeRoute)
app.use(electionRoutes)

const PORT = process.env.PORT

// use express async errors handler
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).send('Something went wrong')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
