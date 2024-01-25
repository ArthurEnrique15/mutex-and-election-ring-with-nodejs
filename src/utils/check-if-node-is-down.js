export const checkIfNodeIsDown = ({ status, data }) => {
  if (
    status === 500 &&
    (data.error.code === 'ECONNREFUSED' || data.error.code === 'ENOTFOUND')
  ) {
    return true
  }

  return false
}
