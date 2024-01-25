import { Router } from 'express'

import {
  NODE_ID,
  CONFIG,
  IS_FILE_OWNER,
  FILE_OWNER_ID,
} from '../config/global.js'
import { sleep } from '../utils/sleep.js'
import { sendRequestToNextNeighbor } from '../utils/send-request-to-next-neighbor.js'
import { writeInFile } from '../utils/write-in-file.js'
import { api } from '../utils/api.js'
import { getNodeUrl } from '../utils/get-node-url.js'

const writeRoute = Router()

writeRoute.post('/write', async (req, res) => {
  const timestamp = new Date().toISOString()

  const { status: requestAccessStatus, data: requestAccessData } = await api({
    url: `${CONFIG.CURRENT_LEADER_URL}/request-access`,
    method: 'POST',
    headers: {
      node_id: NODE_ID,
    },
  })

  if (
    requestAccessStatus === 500 &&
    requestAccessData.error.code === 'ECONNREFUSED'
  ) {
    console.log('leader is down, starting election')

    await sendRequestToNextNeighbor({
      route: '/election',
      method: 'POST',
      headers: { previous_node_id: NODE_ID },
      messageType: 'election',
    })

    return res.json({ message: 'Election started' })
  }

  if (requestAccessStatus !== 200) {
    return res.status(requestAccessStatus).json(requestAccessData)
  }

  console.log('got access')

  for (let i = 0; i < 10; i++) {
    console.log('writing...', i)
    await sleep(1000)
  }

  const hostname = getNodeUrl(NODE_ID)

  if (IS_FILE_OWNER) {
    writeInFile({
      node_id: NODE_ID,
      hostname,
      timestamp,
    })
  } else {
    const fileOwnerBaseUrl = getNodeUrl(FILE_OWNER_ID)

    const { status: accessStatus, data: accessData } = await api({
      url: `${fileOwnerBaseUrl}/access-file`,
      method: 'POST',
      data: { hostname, timestamp },
      headers: { node_id: NODE_ID },
    })

    if (accessStatus !== 200) {
      console.log('error writing in file', { accessStatus, accessData })
      return res.status(accessStatus).json(accessData)
    }
  }

  console.log('wrote in file, releasing access')

  const { status: releaseAccessStatus, data: releaseAccessData } = await api({
    url: `${CONFIG.CURRENT_LEADER_URL}/release-access`,
    method: 'POST',
    headers: { node_id: NODE_ID },
  })

  if (releaseAccessStatus !== 200) {
    return res.status(releaseAccessStatus).json(releaseAccessData)
  }

  console.log('access released')

  return res.json({ message: 'File written' })
})

export { writeRoute }
