import { TicketsDb } from '../db'
import bodyParser from 'body-parser'

var express = require('express')
var router = express.Router()

// GET /api/tickets
router.get('/', async (req, res) => {
  console.info(req.originalUrl)
  let payments = await new TicketsDb().get()

  res.json(payments)
})

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  console.info(req.originalUrl)
  console.log(req.params.id)
  let payments = await new TicketsDb().get(req.params.id)
  console.log(payments)
  
  res.json(payments)
})

// POST /api/tickets
router.post('/', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().post(req.body)

  res.sendStatus(200)
})

// PATCH /api/tickets/id
router.patch('/:id', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  let id = req.params.id
  await new TicketsDb().patch(id, req.body)

  res.sendStatus(200)
})

module.exports = router
