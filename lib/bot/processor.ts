import { Ticker } from 'ccxt'
import { BaseExchange } from '../exchange/base'
import { BinanceFuture } from '../exchange/binance-future'
import { ORDER_MARKET, ORDER_SELL } from '../exchange/const'
import { Log } from '../helper/log'

export default class Processor {
  private _cycle: number = 0

  private _exchange: BaseExchange

  public get exchange(): BaseExchange {
    if (!this._exchange) {
      // TODO: dynamic load exchange
      this._exchange = new BinanceFuture()
    }

    return this._exchange
  }

  public set exchange(value: BaseExchange) {
    this._exchange = value
  }

  public get cycle(): number {
    return this._cycle
  }

  public set cycle(value: number) {
    this._cycle = value
  }
  start() {
    let instance = this
    setInterval(async function () {
      try {
        await instance.processMarket()
        console.log(`PROCESSED #${instance.cycle}`, new Date().toString())
      } catch (e) {
        Log.error(e)
      }
    }, this.exchange.configs.delay * 1000)
  }
  async processMarket() {
    let positions: Array<any> = await this.exchange.getPositions()
    let tickers = await this.exchange.getTickers()
    let configs = this.exchange.configs
    this.cycle++

    positions.forEach(async position => {
      let { symbol, liquidationPrice, contracts } = position
      let ticker: Ticker = tickers[symbol] ?? false
      let lastTickerPrice = ticker?.last

      if (!lastTickerPrice) {
        return
      }

      if (liquidationPrice < lastTickerPrice * configs.maxLiquidPriceRatio) {
        // safe switch #1
        Log.info('RESULT: Liquidation safe-switch triggered. Exiting.')
        return
      }

      if (contracts > configs.maxTotalContractCount) {
        // safe switch #2
        Log.info('RESULT: Contract limitation reached. Exiting.')
        return
      }

      if (!contracts) {
        Log.info('RESULT: New position has been opened.')
        // TODO: uncomment this
        // this.createOrder(symbol, ORDER_LIMIT, ORDER_SELL, 1)
        return
      }

      Log.info(`**** PROCESSING #${this.cycle} ****`)
      let order = await this.exchange.getLastOrder(symbol)
      let lastOrderDate = order?.datetime
      let lastOrderPrice = order?.price
      let lastOrderSide = order?.side
      if (!lastOrderPrice) {
        Log.info('RESULT: Invalid last order. Exiting.')
        return
      }

      let priceDiff = 0
      if (lastOrderSide == ORDER_SELL) {
        priceDiff = Math.round((lastTickerPrice / lastOrderPrice - 1) * 100 * 100) / 100
      }
      Log.info(`Ticker ${lastTickerPrice} | Order: ${lastOrderPrice} - ${lastOrderDate} | Diff: ${priceDiff}%`)
      Log.info(position)

      if (priceDiff > configs.dcaLevel) {
        let totalContracts = position.contracts
        let dcaSize = configs.dcaMinContractCount
        if (totalContracts) {
          dcaSize = Math.max(Math.floor(totalContracts * configs.dcaRate * 0.01), dcaSize)
          dcaSize = Math.min(dcaSize, configs.dcaMaxContractCount)
        }

        let order = await this.exchange.createOrder(symbol, ORDER_MARKET, ORDER_SELL, dcaSize)

        Log.info('RESULT: DCA order created.')
        Log.info(order)
      } else {
        Log.info('Nothing to DCA. Exiting')
      }
    })
  }
}
