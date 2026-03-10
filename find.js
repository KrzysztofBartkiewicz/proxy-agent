import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const locationApi = 'https://hub.ag3nts.org/api/location'
const suspects = [
  {
    name: 'Cezary',
    surname: 'Żurek',
    gender: 'M',
    born: 1987,
    city: 'Grudziądz',
    tags: ['transport']
  },
  {
    name: 'Jacek',
    surname: 'Nowak',
    gender: 'M',
    born: 1991,
    city: 'Grudziądz',
    tags: ['transport']
  },
  {
    name: 'Oskar',
    surname: 'Sieradzki',
    gender: 'M',
    born: 1993,
    city: 'Grudziądz',
    tags: ['transport']
  },
  {
    name: 'Wojciech',
    surname: 'Bielik',
    gender: 'M',
    born: 1986,
    city: 'Grudziądz',
    tags: ['transport']
  },
  {
    name: 'Wacław',
    surname: 'Jasiński',
    gender: 'M',
    born: 1986,
    city: 'Grudziądz',
    tags: ['transport']
  }
]

const locations = JSON.parse(fs.readFileSync('./findhim_locations.json', 'utf-8'))
const locationValues = { ...locations.power_plants }
const plants = Object.entries(locationValues).map(([key, value]) => ({
  city: key,
  code: value.code
}))

async function geocodeCity(city) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    city + ', Poland'
  )}&format=jsonv2&limit=5`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ai-devs-training'
    }
  })

  const data = await response.json()

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon)
  }
}

function distanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371

  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

for (const plant of plants) {
  const coords = await geocodeCity(plant.city)
  plant.latitude = coords.latitude
  plant.longitude = coords.longitude
  await new Promise(r => setTimeout(r, 1100))
}

console.log(plants)

const suspectsPromises = suspects.map(({ name, surname }) => {
  return fetch(locationApi, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: process.env.AI_DEVS_API_KEY,
      name,
      surname
    })
  })
})

Promise.all(suspectsPromises)
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then(async res => {
    const mappedLocations = res.map((location, i) => {
      return {
        person: { name: suspects[i].name, surname: suspects[i].surname, born: suspects[i].born },
        locations: location.map(({ latitude, longitude }) => {
          return {
            latitude,
            longitude
          }
        })
      }
    })

    let bestDistance = Infinity
    let bestPerson = null
    let bestPlant = null

    for (const suspect of mappedLocations) {
      for (const location of suspect.locations) {
        for (const plant of plants) {
          const distance = distanceInKm(
            location.latitude,
            location.longitude,
            plant.latitude,
            plant.longitude
          )

          if (distance < bestDistance) {
            bestDistance = distance
            bestPerson = suspect.person
            bestPlant = plant
          }
        }
      }
    }

    let accessLevel

    const getAccessLevel = async () => {
      const accessResponse = await fetch('https://hub.ag3nts.org/api/accesslevel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apikey: process.env.AI_DEVS_API_KEY,
          name: bestPerson.name,
          surname: bestPerson.surname,
          birthYear: bestPerson.born
        })
      })

      const accessData = await accessResponse.json()
      accessLevel = accessData.accessLevel
    }

    await getAccessLevel()

    const payload = {
      apikey: process.env.AI_DEVS_API_KEY,
      task: 'findhim',
      answer: {
        name: bestPerson.name,
        surname: bestPerson.surname,
        accessLevel: accessLevel,
        powerPlant: bestPlant.code
      }
    }

    const send = async () => {
      const verifyResponse = await fetch('https://hub.ag3nts.org/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const verifyData = await verifyResponse.json()
      console.log(verifyData)
    }

    send()

    console.log({ bestDistance, bestPerson, bestPlant })
  })
