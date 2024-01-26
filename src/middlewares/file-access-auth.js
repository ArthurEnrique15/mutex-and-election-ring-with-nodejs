import { CONFIG } from '../config/global.js'

export const fileAccessAuthMiddleware = (req, res, next) => {
  const { node_id } = req.headers

  if (!node_id || CONFIG.CURRENT_ALLOWED_NODE_ID !== Number(node_id)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  return next()
}
