import { Order } from 'ccxt'
import { PairConfig } from '../config/config'
import { BaseExchange } from '../exchange/base'
import { DIRECTION_LONG, DIRECTION_SHORT, ORDER_BUY, ORDER_MARKET, ORDER_SELL } from '../exchange/const'
import { Log } from '../helper/log'

export default class Worker {
  constructor(private exchange: BaseExchange, private config: PairConfig) {}
  async start() {
    try {
      let symbol = this.config.symbol
      let position = await this.exchange.getPosition(symbol)

      if (!position?.contracts) {
        return await this.openPosition()
      }

      return await this.processDca(position)
    } catch (e) {
      Log.error(new Error().stack)
    }
  }
  async openPosition() {
    // TODO: implement this
    // Log.info('RESULT: New position has been opened.')
    // this.createOrder(symbol, ORDER_LIMIT, ORDER_SELL, 1)
  }
  async processDca(position: any) {
    let config = this.config
    let symbol = config.symbol
    let ticker = await this.exchange.getTicker(symbol)
    let lastTickerPrice = ticker?.last
    let { contracts, liquidationPrice } = position

    Log.info(position)
    if (!lastTickerPrice) {
      return Log.info('WARN: Invalid ticker. Exiting.')
    }

    if (liquidationPrice < lastTickerPrice * config.maxLiquidPriceRatio) {
      // safe switch #1
      return Log.info('WARN: Liquidation limitation reached. Exiting.')
    }

    if (contracts > config.maxTotalContractCount) {
      // safe switch #2
      return Log.info('WARN: Contract limitation reached. Exiting.')
    }

    let lastOrder = await this.exchange.getLastOrder(symbol)
    if (!lastOrder?.price) {
      return Log.info('WARN: Invalid last order. Exiting.')
    }

    let lastOrderDate = lastOrder?.datetime
    let lastOrderPrice = lastOrder?.price
    let priceDiff = this.calculatePriceDiff(lastTickerPrice, lastOrderPrice, config.direction)
    let dcaLevel = config.dcaLevel * -1 // verbose reading
    let dcaSize = this.calculateDcaSize(
      contracts,
      config.dcaRate,
      config.dcaMinContractCount,
      config.dcaMaxContractCount
    )

    Log.info(
      `Ticker ${lastTickerPrice} | Order: ${lastOrderPrice} - ${lastOrderDate} | Diff: ${priceDiff}% | DcaSize: ${dcaSize}`
    )

    if (!priceDiff || priceDiff > dcaLevel) {
      return Log.info('WARN: Nothing to DCA. Exiting')
    }

    let order = await this.createDcaOrder(symbol, config.direction, dcaSize)
    if (!order) {
      return Log.info('RESULT: DCA order failed.')
    }

    Log.info('RESULT: DCA order created.')
    Log.info(order)
  }
  async createDcaOrder(symbol: string, direction: string, dcaSize: number): Promise<Order | undefined> {
    switch (direction) {
      case DIRECTION_LONG:
        return await this.exchange.createOrder(symbol, ORDER_MARKET, ORDER_BUY, dcaSize)
      case DIRECTION_SHORT:
        return await this.exchange.createOrder(symbol, ORDER_MARKET, ORDER_SELL, dcaSize)
    }
  }
  calculatePriceDiff(lastTickerPrice: number, lastOrderPrice: number, direction: string): number {
    if (!lastOrderPrice) {
      return 0
    }

    let diff = (lastTickerPrice / lastOrderPrice - 1) * 100
    diff = Math.round(diff * 100) / 100

    switch (direction) {
      case DIRECTION_LONG:
        return diff
      case DIRECTION_SHORT:
        return diff * -1
    }

    return 0
  }
  calculateDcaSize(currentSize: number, dcaRate: number, minSize: number, maxSize: number): number {
    if (!currentSize) {
      return 0
    }

    let dcaSize = Math.floor(currentSize * dcaRate * 0.01)
    dcaSize = Math.max(dcaSize, minSize)
    dcaSize = Math.min(dcaSize, maxSize)
    return dcaSize
  }
}
