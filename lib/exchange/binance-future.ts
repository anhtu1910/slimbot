import ccxt, { binanceusdm } from 'ccxt'
import { ExchangeConfig } from '../config/config'
import { FutureExchange } from './base'

export class BinanceFuture extends FutureExchange {
  protected instance: binanceusdm

  constructor(config: ExchangeConfig) {
    super(config)
    this.instance = new ccxt.binanceusdm({
      apiKey: this.config.apiKey,
      secret: this.config.apiSecret,
    })
  }
}
