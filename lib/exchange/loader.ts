import { ConfigLoader } from '../config/loader'
import { BaseExchange } from './base'
import { BinanceFuture } from './binance-future'

const exchangeMap = new Map()
exchangeMap.set('binanceusdm', BinanceFuture)

export class ExchangeLoader {
  static load(identifier: string): BaseExchange {
    let handler = exchangeMap.get(identifier)
    let config = ConfigLoader.load().exchanges.get(identifier)
    if (handler && config) {
      return new handler(config)
    }

    throw 'Exchange handler not found'
  }
}
