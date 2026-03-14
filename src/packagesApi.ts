const API_URL = 'https://hub.ag3nts.org/api/packages'
const API_KEY = process.env.AI_DEVS_API_KEY

export async function check_package(packageid: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: API_KEY,
      action: 'check',
      packageid
    })
  })

  if (!res.ok) {
    throw new Error(`Packages API error: ${res.status}`)
  }

  return res.json()
}

export async function redirect_package(packageid: string, destination: string, code: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: API_KEY,
      action: 'redirect',
      packageid,
      destination,
      code
    })
  })

  if (!res.ok) {
    throw new Error(`Packages API error: ${res.status}`)
  }

  return res.json()
}
