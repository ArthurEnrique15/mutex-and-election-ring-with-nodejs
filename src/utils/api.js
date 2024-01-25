import axios from 'axios'

export const api = async ({ url, method, data, headers }) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers,
    })

    return response
  } catch (error) {
    if (error.response) {
      return error.response
    }

    return { status: 500, data: { error } }
  }
}
