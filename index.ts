import { createHmac } from 'crypto'
import dotenv from 'dotenv'
import express from 'express'
import graphqlHTTP from 'express-graphql'
import { createGraphQlSchema } from 'openapi-to-graphql'
import * as BusOas2 from './ptx.bus.v2.json'
import * as RailOas2 from './ptx.rail.v2.json'
import * as BikeOas2 from './ptx.bike.v2.json'

async function main() {
    const oases = [BusOas2, RailOas2, BikeOas2]
    // Quick and dirty way to refresh token headers
    // In every request...
    // (Use getter in options did not work for some reason)
    const requestOptions = {
        url: '',
        get headers() {
            const dateStr = new Date().toUTCString()
            const hmac = createHmac('sha1', process.env.PTX_APP_KEY || '')
            hmac.write(`x-date: ${dateStr}`)
            hmac.end()
            const signature = hmac.read().toString('base64')
            return {
                'Authorization': `hmac username="${process.env.PTX_APP_ID}", algorithm="hmac-sha1",`+
                                 ` headers="x-date", signature="${signature}"`,
                'x-date': dateStr
            }
        }
    }
    const { schema, report } = await createGraphQlSchema(oases, { requestOptions })
    console.log(report)
    const app = express()
    app.use('/', graphqlHTTP({schema, graphiql: true}))
    app.listen(3001)
}  
dotenv.config()
main()
