import { api } from './api.js'
import { NODE_ID, TOTAL_NODES } from '../config/global.js'
import { getNodeUrl } from './get-node-url.js'

const getNextNeighborUrl = (jumps) => {
  if (NODE_ID + jumps + 1 <= TOTAL_NODES) {
    return getNodeUrl(NODE_ID + 1 + jumps)
  }

  return getNodeUrl(1)
}

export const sendRequestToNextNeighbor = async ({
  route,
  method,
  headers,
  messageType,
}) => {
  let jumps = 0

  let nextNeighborUrl = getNextNeighborUrl(jumps)

  console.log(`sending ${messageType} message to `, nextNeighborUrl)

  let response = await api({
    url: `${nextNeighborUrl}${route}`,
    method,
    headers,
  })

  while (
    response.status === 500 &&
    response.data.error.code === 'ECONNREFUSED'
  ) {
    jumps++

    nextNeighborUrl = getNextNeighborUrl(jumps)

    console.log(`sending ${messageType} message to `, nextNeighborUrl)

    response = await api({
      url: `${nextNeighborUrl}${route}`,
      method,
      headers,
    })
  }
}
