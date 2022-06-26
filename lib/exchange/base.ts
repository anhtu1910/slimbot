import { Exchange, Order, Ticker } from 'ccxt'
import { ExchangeConfig } from '../config/config'
import { Log } from '../helper/log'
import { LastOrders } from '../models/last-order'

interface ExchangeInterface {
  createOrder(symbol: string, type: Order['type'], side: Order['side'], contract: number): Promise<Order | undefined>
  getTicker(symbol: string): Promise<Ticker>
  getOrders(pair: string, limit: number): Promise<Order[]>
  getLastOrder(symbol: string): Promise<Order | undefined>
  getPosition(symbol: string): Promise<any>
  getPositions(symbols: Array<string>): Promise<any[]>
  getLastOrderFromCache(symbol: string): Promise<any>
  saveLastOrderToCache(order?: Order): Promise<any>
}

export abstract class BaseExchange implements ExchangeInterface {
  protected instance: Exchange

  constructor(
    // config
    protected config: ExchangeConfig
  ) {}

  async createOrder(
    symbol: string,
    type: Order['type'],
    side: Order['side'],
    contract: number
  ): Promise<Order | undefined> {
    try {
      let order = await this.instance.createOrder(symbol, type, side, contract)

      if (!order.datetime) {
        // handle missing datetime
        order.datetime = new Date().toISOString()
      }

      this.saveLastOrderToCache(order)

      return order
    } catch (e) {
      console.log(e)
    }
  }

  async getTicker(symbol: string): Promise<Ticker> {
    return await this.instance.fetchTicker(symbol)
  }

  async getOrders(pair: string, limit: number): Promise<Order[]> {
    return await this.instance.fetchOrders(pair, undefined, limit)
  }

  async getLastOrder(symbol: string): Promise<Order | undefined> {
    let order = (await this.getOrders(symbol, 1)).shift()
    let cachedOrder = await this.getLastOrderFromCache(symbol)

    if (!cachedOrder) {
      Log.info('cache missed')
      this.saveLastOrderToCache(order)
      return order
    }

    if (!order || !order.datetime) {
      return cachedOrder
    }

    let orderDate = new Date(order.datetime)
    let cachedOrderDate = cachedOrder.datetime ? new Date(cachedOrder.datetime) : 0
    if (cachedOrderDate < orderDate) {
      await this.saveLastOrderToCache(order)
      return order
    }

    Log.info('cache hit')
    return cachedOrder
  }

  async getPosition(symbol: string): Promise<any> {
    return
  }
  async getPositions(symbols: Array<string>): Promise<any[]> {
    return []
  }
  async getLastOrderFromCache(symbol: string): Promise<any> {
    let order = await LastOrders.findOne({
      where: {
        symbol: symbol,
      },
    })

    return order
  }

  async saveLastOrderToCache(order?: Order): Promise<any> {
    if (!order) {
      return
    }

    await LastOrders.destroy({
      where: {
        symbol: order.symbol,
      },
    })

    return await LastOrders.create({ ...order })
  }
}

export class FutureExchange extends BaseExchange {
  async getPosition(symbol: string): Promise<any> {
    return (await this.instance.fetchPositions([symbol])).shift()
  }
  async getPositions(symbols: Array<string>): Promise<any[]> {
    return await this.instance.fetchPositions(symbols)
  }
  // async closePosition(symbol: string, type: Order['type'], side: Order['side'], contract: number) {
  //   // TODO: complete this function
  //   return this.instance.createOrder(symbol, type, side, contract, undefined, {
  //     closePosition: true,
  //   })
  // }
}

export class SpotExchange extends BaseExchange {}
