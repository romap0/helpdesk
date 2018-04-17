import { TicketsDb } from '../db'
import { Comment } from '../models/comment'
import { Message } from '../models/message'
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
  let tickets = await new TicketsDb().get(req.params.id)

  res.json(tickets)
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

// POST /api/tickets/:id/messages
router.post('/:id/messages', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().addMessage(req.params.id, new Message(req.body.userId, req.body.text))

  res.sendStatus(200)
})

// POST /api/tickets/:id/comments
router.post('/:id/comments', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().addComment(req.params.id, new Comment(req.body.userId, req.body.text))

  res.sendStatus(200)
})

module.exports = router
