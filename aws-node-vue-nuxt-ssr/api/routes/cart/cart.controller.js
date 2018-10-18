const express = require('express')
const cartController = express.Router()

cartController
  .post('/', async (req, res, next) => {
    // const item = await MagentoAPI.create(req.body)
    res.status(200).send('Added an item to the Cart.')
  })

cartController
  .put('/:id', async (req, res, next) => {
    // const item = await MagentoAPI.findByIdAndUpdate(req.params.id, { $set: req.body }, { $upsert: true, new: true })
    res.status(200).send('Updated an item in the Cart.')
  })

cartController
  .get('/', async (req, res, next) => {
    // const items = await MagentoAPI.find()
    res.status(200).send('Get all items in the Cart')
  })

cartController
  .get('/:id', async (req, res, next) => {
    // const item = await MagentoAPI.findById(req.params.id)
    res.status(200).send('Get one item from the Cart')
  })

cartController
  .delete('/:id', async (req, res, next) => {
    // const item = await MagentoAPI.deleteOne({ _id: req.params.id })
    res.status(200).send('Delete an item from the Cart')
  })

module.exports = cartController
