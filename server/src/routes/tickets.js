import { TicketsDb } from '../db'
import bodyParser from 'body-parser'

var express = require('express')
var router = express.Router()

// GET /api/tickets
router.get('/', async (req, res) => {
  let payments = await new TicketsDb().get()

  res.json(payments)
})

// POST /api/tickets
router.post('/', bodyParser.json(), async (req, res) => {
  await new TicketsDb().put(req.body)

  res.sendStatus(200)
})

// PATCH /api/tickets/id
router.patch('/:id', bodyParser.json(), async (req, res) => {
  let id = req.params.id
  await new TicketsDb().patch(id, req.body)

  res.sendStatus(200)
})

module.exports = router
