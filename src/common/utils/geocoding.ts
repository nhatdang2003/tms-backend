import axios from 'axios'

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.GOONG_API_KEY
  if (!apiKey) throw new Error('Missing GOONG_API_KEY')

  const url = `https://rsapi.goong.io/geocode`
  const resp = await axios.get(url, {
    params: {
      address,
      api_key: apiKey,
    },
  })

  const data = resp.data
  if (!data.results?.length) {
    throw new Error(`Không tìm được tọa độ cho địa chỉ: ${address}`)
  }

  const { lat, lng } = data.results[0].geometry.location
  return { lat, lng }
}
