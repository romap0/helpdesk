import { TicketsDb } from '../db'
import { Comment } from '../models/comment'
import { Message } from '../models/message'
import bodyParser from 'body-parser'
import { Bot } from '../bot/bot'

var express = require('express')
var router = express.Router()

// GET /api/tickets
router.get('/', async (req, res) => {
  console.info(req.originalUrl)
  let tickets = await new TicketsDb().get()

  res.json(tickets)
})

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  console.info(req.originalUrl)
  let ticket = await new TicketsDb().get(req.params.id)

  res.json(ticket)
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
  let updatedTicket = await new TicketsDb().addMessage(req.params.id, new Message(req.body.userId, req.body.text))

  Bot.sendMessage(updatedTicket.value.userId,
    `*Ответ на тикет:*\n_${req.body.text}_`)

  res.sendStatus(200)
})

// POST /api/tickets/:id/comments
router.post('/:id/comments', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().addComment(req.params.id, new Comment(req.body.userId, req.body.text))

  res.sendStatus(200)
})

// PUT /api/tickets/:id/status
router.put('/:id/status', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().setStatus(req.params.id, req.body.status)

  res.sendStatus(200)
})

// PUT /api/tickets/:id/tags
router.put('/:id/tags', bodyParser.json(), async (req, res) => {
  console.info(req.originalUrl)
  await new TicketsDb().setTags(req.params.id, req.body.tags)

  res.sendStatus(200)
})

module.exports = router
