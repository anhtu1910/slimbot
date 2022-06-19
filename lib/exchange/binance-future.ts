import ccxt, { binanceusdm } from 'ccxt'
import { FutureExchange } from './base'

export class BinanceFuture extends FutureExchange {
  protected instance: binanceusdm

  constructor() {
    super()
    this.instance = new ccxt.binanceusdm({
      apiKey: this.configs.apiKey,
      secret: this.configs.secret,
    })
  }
}
