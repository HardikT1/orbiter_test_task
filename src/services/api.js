import axios from 'axios'

const API_URL = 'https://xsrr-l2ye-dpbj.f2.xano.io/api:oUvfVMO5/receive_week'

export const getOrbits = async (startDate) => {
  try {
    const response = await axios.get(`${API_URL}?start_date=${startDate}`)
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}
