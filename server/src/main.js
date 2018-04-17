import { MongoService } from './services/mongoService'
import { urlencoded } from 'body-parser'
import express from 'express'
import { createServer } from 'http'
import nodeCleanup from 'node-cleanup'
import { Bot } from './bot/bot'
require('dotenv-expand')(require('dotenv').config())

const app = express()
const server = createServer(app)

app.use(urlencoded({ extended: true }))

app.use('/api/tickets', require('./routes/tickets'))

nodeCleanup(function (exitCode, signal) {
  MongoService.disconnect()
})

MongoService.connect().then(async () => {
  await server.listen(process.env.PORT || 8090)
  console.info(`Server started on http://localhost:${server.address().port}`)

  Bot.start()
})
