require('dotenv-expand')(require('dotenv').config())

import { MongoService } from './services/mongoService'

import express from "express";
import { createServer } from "http";
import nodeCleanup from "node-cleanup";

const app = express()
const server = createServer(app)
import { urlencoded } from "body-parser";

app.use(urlencoded({ extended: true }))

app.use('/api/tickets', require('./routes/tickets'))

nodeCleanup(function (exitCode, signal) {
  MongoService.disconnect()
})

MongoService.connect().then(() => {
  server.listen(process.env.PORT || 8090, () => {
    console.info(`Server started on http://localhost:${server.address().port}`)
  })
})
