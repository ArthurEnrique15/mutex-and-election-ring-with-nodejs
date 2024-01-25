import { NODE_ID, CONFIG } from '../config/global.js'

export const thisIsTheLeaderAuthMiddleware = (req, res, next) => {
  if (CONFIG.CURRENT_LEADER_ID !== NODE_ID) {
    return res.status(403).json({ error: 'This is not the leader' })
  }

  return next()
}
