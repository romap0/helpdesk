import { UsersDb } from '../db'

var express = require('express')
var router = express.Router()

// GET /api/users
router.get('/', async (req, res) => {
  console.info(req.originalUrl)
  let users = await new UsersDb().get()

  res.json(users)
})

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  console.info(req.originalUrl)
  let user = await new UsersDb().get(req.params.id)

  res.json(user)
})

module.exports = router
