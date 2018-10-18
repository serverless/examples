const express = require('express')
const router = express.Router()
// Add all routes here
router.get('/', (req, res, next) => res.status(200).send('Api works!'))
const cart = require('./cart/cart.controller')
router.use('/cart', cart)
module.exports = router
