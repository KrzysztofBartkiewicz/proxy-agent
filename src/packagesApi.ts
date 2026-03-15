const API_URL = 'https://hub.ag3nts.org/api/packages'
const API_KEY = process.env.AI_DEVS_API_KEY

export async function check_package(packageid: string) {
  const payload = {
    apikey: API_KEY,
    action: 'check',
    packageid
  }

  console.log('check_package payload:', JSON.stringify(payload))

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  console.log('check_package status:', res.status)
  console.log('check_package body:', text)

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Packages API returned non-JSON: ${text}`)
  }

  if (!res.ok) {
    throw new Error(`Packages API error: ${res.status} ${JSON.stringify(data)}`)
  }

  return data
}

export async function redirect_package(packageid: string, destination: string, code: string) {
  const payload = {
    apikey: API_KEY,
    action: 'redirect',
    packageid,
    destination,
    code
  }

  console.log('redirect_package payload:', JSON.stringify(payload))

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  const text = await res.text()
  console.log('redirect_package status:', res.status)
  console.log('redirect_package body:', text)

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Packages API returned non-JSON: ${text}`)
  }

  if (!res.ok) {
    throw new Error(`Packages API error: ${res.status} ${JSON.stringify(data)}`)
  }

  return data
}
