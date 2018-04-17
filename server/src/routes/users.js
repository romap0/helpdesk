import { UsersDb } from '../db'

var express = require('express')
var router = express.Router()

// GET /api/users
router.get('/', async (req, res) => {
  console.info(req.originalUrl)
  let users = await new UsersDb().get()

  res.json(users)
})

module.exports = router
