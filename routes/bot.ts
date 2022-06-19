import { NextFunction, Request, Response } from 'express'
import Processor from '../lib/bot/processor'
import { Log } from '../lib/helper/log'

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
  processor.processMarket()
  res.send({
    message: 'run bot debugger, please check the terminal output',
  })
})

module.exports = router
