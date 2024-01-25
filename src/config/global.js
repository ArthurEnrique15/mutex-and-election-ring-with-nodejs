import { getNodeUrl } from '../utils/get-node-url.js'

export const NODE_ID = Number(process.env.NODE_ID)
export const FILE_OWNER_ID = Number(process.env.FILE_OWNER_ID)
export const TOTAL_NODES = 4

export const CONFIG = {
  CURRENT_LEADER_ID: 2,
  CURRENT_LEADER_URL: getNodeUrl(2),
  CURRENT_ALLOWED_NODE_ID: null,
}

export const IS_FILE_OWNER = NODE_ID === FILE_OWNER_ID
