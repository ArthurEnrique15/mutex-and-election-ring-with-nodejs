import { Router } from 'express'

import { NODE_ID, CONFIG } from '../config/global.js'
import { sendRequestToNextNeighbor } from '../utils/send-request-to-next-neighbor.js'
import { getNodeUrl } from '../utils/get-node-url.js'

const electionRoutes = Router()

electionRoutes.post('/election', async (req, res) => {
  const { previous_node_id } = req.headers

  console.log('received election message from ', previous_node_id)

  if (NODE_ID > Number(previous_node_id)) {
    await sendRequestToNextNeighbor({
      route: '/election',
      method: 'POST',
      headers: { previous_node_id: NODE_ID },
      messageType: 'election',
    })

    return res.json({ message: 'Election started' })
  }

  CONFIG.CURRENT_LEADER_ID = Number(previous_node_id)
  CONFIG.CURRENT_LEADER_URL = getNodeUrl(previous_node_id)

  await sendRequestToNextNeighbor({
    route: '/leader',
    method: 'POST',
    headers: { new_leader_node_id: previous_node_id },
    messageType: 'new leader',
  })

  return res.json({ message: 'leader defined' })
})

electionRoutes.post('/leader', async (req, res) => {
  const { new_leader_node_id } = req.headers

  console.log('received new leader message, new leader is', new_leader_node_id)

  CONFIG.CURRENT_LEADER_ID = Number(new_leader_node_id)
  CONFIG.CURRENT_LEADER_URL = getNodeUrl(new_leader_node_id)

  if (CONFIG.CURRENT_LEADER_ID !== NODE_ID) {
    await sendRequestToNextNeighbor({
      route: '/leader',
      method: 'POST',
      headers: { new_leader_node_id },
      messageType: 'new leader',
    })
  }

  return res.json({ message: 'leader defined' })
})

export { electionRoutes }
