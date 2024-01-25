export const getNodeUrl = (node_id) => {
  if (process.env.NODE_ENV === 'dev') {
    return `http://localhost:300${node_id}`
  }

  return `http://node${node_id}:3000`
}
