import { NextFunction, Request, Response } from 'express'
import Processor from '../lib/bot/processor'
import { LastOrders } from '../lib/models/last-order'

var express = require('express')
var router = express.Router()
let processor = new Processor()

/* GET home page. */
router.get('/', function (req: Request, res: Response, next: NextFunction) {
  res.send({
    message: 'welcome',
  })
})

router.get('/start', function (req: Request, res: Response, next: NextFunction) {
  processor.start()
  res.send({
    message: 'bot started',
  })
})

router.get('/debug', function (req: Request, res: Response, next: NextFunction) {
  processor.process()
  res.send({
    message: 'run bot debugger, please check the terminal output',
  })
})

router.get('/last-orders', async function (req: Request, res: Response, next: NextFunction) {
  let orders = await LastOrders.findAll()
  res.send(orders)
})

module.exports = router
