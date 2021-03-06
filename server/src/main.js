// import { MongoService } from './services/mongoService'
import { urlencoded } from 'body-parser'
import express from 'express'
import { createServer } from 'http'
import nodeCleanup from 'node-cleanup'
import { Bot } from './bot/bot'
import moment from 'moment'
require('dotenv-expand')(require('dotenv').config())

moment.locale('ru')

const app = express()
const server = createServer(app)

app.use(urlencoded({ extended: true }))

app.use('/api/tickets', require('./routes/tickets'))
app.use('/api/users', require('./routes/users'))

nodeCleanup(function (exitCode, signal) {
  // MongoService.disconnect()
})

// MongoService.connect().then(async () => {
server.listen(process.env.PORT || 8090)

console.info(`Server started on http://localhost:${server.address().port}`)

Bot.start()
// })
