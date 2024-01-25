import { Router } from 'express'

import { leaderAuthMiddleware } from '../middlewares/leader-auth.js'
import { fileAccessAuthMiddleware } from '../middlewares/file-access-auth.js'
import { writeInFile } from '../utils/write-in-file.js'
import { CONFIG } from '../config/global.js'

const fileOwnerRoutes = Router()

fileOwnerRoutes.patch(
  '/current-file-access',
  leaderAuthMiddleware,
  (req, res) => {
    const { current_allowed_node_id } = req.headers

    if (!current_allowed_node_id) {
      CONFIG.CURRENT_ALLOWED_NODE_ID = null

      console.log('current file access removed')
      return res.json({ message: 'Current access removed' })
    }

    CONFIG.CURRENT_ALLOWED_NODE_ID = Number(current_allowed_node_id)

    console.log(
      'current file access updated for node ',
      CONFIG.CURRENT_ALLOWED_NODE_ID,
    )

    return res.json({ message: 'Current access updated' })
  },
)

fileOwnerRoutes.post('/access-file', fileAccessAuthMiddleware, (req, res) => {
  const { hostname, timestamp } = req.body
  const { node_id } = req.headers

  console.log('FILE OWNER - writing in file, request from node ', node_id)

  writeInFile({ node_id, hostname, timestamp })

  return res.json({ message: 'File accessed' })
})

export { fileOwnerRoutes }
