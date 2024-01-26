import { Router } from 'express'

import { thisIsTheLeaderAuthMiddleware } from '../middlewares/this-is-the-leader-auth.js'
import { fileAccessAuthMiddleware } from '../middlewares/file-access-auth.js'
import {
  CONFIG,
  IS_FILE_OWNER,
  FILE_OWNER_ID,
  NODE_ID,
} from '../config/global.js'
import { sleep } from '../utils/sleep.js'
import { api } from '../utils/api.js'
import { getNodeUrl } from '../utils/get-node-url.js'

const leaderRoutes = Router()

const ACCESS_QUEUE = []

leaderRoutes.post(
  '/request-access',
  thisIsTheLeaderAuthMiddleware,
  async (req, res) => {
    const { node_id } = req.headers

    console.log(`received access request from node ${node_id}`)

    const nodeId = Number(node_id)

    if (CONFIG.CURRENT_ALLOWED_NODE_ID) {
      if (CONFIG.CURRENT_ALLOWED_NODE_ID === nodeId) {
        return res.status(400).json({ error: 'Node already has access' })
      }

      if (ACCESS_QUEUE.find((id) => id === nodeId)) {
        return res.status(400).json({ error: 'Node already in queue' })
      }

      ACCESS_QUEUE.push(nodeId)

      while (ACCESS_QUEUE.find((id) => id === nodeId)) {
        console.log(
          `node ${nodeId} is waiting node ${CONFIG.CURRENT_ALLOWED_NODE_ID} to finish`,
        )
        console.log(`access queue: ${ACCESS_QUEUE}`)
        await sleep(5000)
      }

      return res.json({ message: 'Access granted' })
    }

    CONFIG.CURRENT_ALLOWED_NODE_ID = nodeId

    if (!IS_FILE_OWNER) {
      const fileOwnerBaseUrl = getNodeUrl(FILE_OWNER_ID)

      const { status, data } = await api({
        url: `${fileOwnerBaseUrl}/current-file-access`,
        method: 'PATCH',
        headers: {
          node_id: NODE_ID,
          current_allowed_node_id: nodeId,
        },
      })

      if (status !== 200) {
        return res.status(status).json(data)
      }
    }

    return res.json({ message: 'Access granted' })
  },
)

leaderRoutes.post(
  '/release-access',
  thisIsTheLeaderAuthMiddleware,
  fileAccessAuthMiddleware,
  async (req, res) => {
    console.log(
      `received access release from node ${CONFIG.CURRENT_ALLOWED_NODE_ID}`,
    )

    if (ACCESS_QUEUE.length > 0) {
      CONFIG.CURRENT_ALLOWED_NODE_ID = ACCESS_QUEUE.shift()
      console.log('access granted to node', CONFIG.CURRENT_ALLOWED_NODE_ID)
    } else {
      CONFIG.CURRENT_ALLOWED_NODE_ID = null
      console.log('no more nodes in queue')
    }

    if (!IS_FILE_OWNER) {
      const fileOwnerBaseUrl = getNodeUrl(FILE_OWNER_ID)

      const { status, data } = await api({
        url: `${fileOwnerBaseUrl}/current-file-access`,
        method: 'PATCH',
        headers: {
          node_id: NODE_ID,
          current_allowed_node_id: CONFIG.CURRENT_ALLOWED_NODE_ID,
        },
      })

      if (status !== 200) {
        return res.status(status).json(data)
      }
    }

    return res.json({ message: 'Access released' })
  },
)

export { leaderRoutes }
