import fs from 'fs'
import csv from 'csv-parser'
import { parseISO } from 'date-fns'
import dotenv from 'dotenv'
dotenv.config()

const results = []
const finalResults = []

let recordsJson

fs.createReadStream('people.csv')
  .pipe(csv())
  .on('data', data => {
    const gender = data.gender
    const now = new Date('2026-06-01')
    const birthDate = new Date(parseISO(data.birthDate))
    const isAgeBetween20And40 =
      birthDate.getFullYear() >= now.getFullYear() - 40 &&
      birthDate.getFullYear() <= now.getFullYear() - 20
    const wasBornInGrudziac = data.birthPlace === 'Grudziądz'

    if (isAgeBetween20And40 && wasBornInGrudziac && gender === 'M') {
      results.push(data)
    }
  })
  .on('end', () => {
    results.forEach((result, index) => {
      finalResults.push({
        id: index + 1,
        job: result.job
      })
    })

    recordsJson = JSON.stringify(finalResults, null, 2)

    const prompt = `
    Classify each job description into one or more allowed tags.

    Allowed tags with descriptions:
    IT - praca związana z technologiami informatycznymi
    transport - praca związana z transportem, logistyką, magazynem
    edukacja - praca związana z nauczaniem, edukacją, szkoleniem
    medycyna - praca związana z opieką zdrowotną, medycyną, farmaceutyką
    praca z ludźmi - praca związana z obsługą klienta, sprzedażą, marketingiem, HR
    praca z pojazdami - praca związana z prowadzeniem pojazdów, transportem, logistyką
    praca fizyczna - praca związana z pracą fizyczną, budownictwem, produkcją, rolnictwem

    Records:
    ${recordsJson}

    You must return exactly one result object for every input record.
    If a record does not match any tag, return an empty tags array for that record.
    Do not skip any record.
    Return ONLY valid JSON.
    [
      { "id": number, "tags": ["tag1", "tag2"] }
    ]
  `

    fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })
      .then(response => response.json())
      .then(data => {
        const jsonResponse = data.choices[0].message.content
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim()
        const parsedResponse = JSON.parse(jsonResponse)

        const withTransportTag = parsedResponse.filter(record => record.tags.includes('transport'))

        const finalOutput = withTransportTag.map(record => {
          const originalRecord = results[record.id - 1]
          return {
            name: originalRecord.name,
            surname: originalRecord.surname,
            gender: originalRecord.gender,
            born: new Date(originalRecord.birthDate).getFullYear(),
            city: originalRecord.birthPlace,
            tags: record.tags
          }
        })

        const payload = {
          apikey: process.env.AI_DEVS_API_KEY,
          task: 'people',
          answer: finalOutput
        }

        console.log(finalOutput)

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
      })
      .catch(error => console.error(error))
  })
