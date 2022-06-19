import { Dictionary, Exchange, Order, Ticker } from 'ccxt'
import { File } from '../helper/file'
import { Log } from '../helper/log'
import { Config } from './config'

interface ExchangeInterface {
  createOrder(symbol: string, type: Order['type'], side: Order['side'], contract: number): Promise<Order>
  getTickers(): Promise<Dictionary<Ticker>>
  getOrders(pair: string, limit: number): Promise<Order[]>
  getLastOrder(symbol: string): Promise<Order | undefined>
  getPositions(): Promise<any[]>
  getLastOrderFromCache(): Order | undefined
  saveLastOrderToCache(order?: Order): any
}

export abstract class BaseExchange implements ExchangeInterface {
  private _configs: Config
  protected instance: Exchange

  public get configs(): Config {
    return this._configs
  }

  protected set configs(value: Config) {
    this._configs = value
  }

  constructor() {
    this.configs = new Config()
  }

  async createOrder(symbol: string, type: Order['type'], side: Order['side'], contract: number): Promise<Order> {
    let order = await this.instance.createOrder(symbol, type, side, contract)

    if (!order.datetime) {
      // handle missing datetime
      order.datetime = new Date().toISOString()
    }

    this.saveLastOrderToCache(order)

    return order
  }

  async getTickers(): Promise<Dictionary<Ticker>> {
    return this.instance.fetchTickers(this.configs.pairs)
  }

  async getOrders(pair: string, limit: number): Promise<Order[]> {
    return this.instance.fetchOrders(pair, undefined, limit)
  }

  async getLastOrder(symbol: string): Promise<Order | undefined> {
    let order = (await this.getOrders(symbol, 1)).shift()
    let cachedOrder = this.getLastOrderFromCache()

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
      this.saveLastOrderToCache(order)
      return order
    }

    Log.info('cache hit')
    return cachedOrder
  }

  async getPositions(): Promise<any[]> {
    return []
  }

  getLastOrderFromCache(): Order | undefined {
    let data = new File('last-order.json').readJSON()

    return data
  }

  saveLastOrderToCache(order?: Order): any {
    if (!order) {
      return
    }

    Log.info('cache updated')
    new File('last-order.json').writeJSON(order)
  }
}

export class FutureExchange extends BaseExchange {
  async getPositions(): Promise<any[]> {
    return this.instance.fetchPositions(this.configs.pairs)
  }
  // async closePosition(symbol: string, type: Order['type'], side: Order['side'], contract: number) {
  //   // TODO: complete this function
  //   return this.instance.createOrder(symbol, type, side, contract, undefined, {
  //     closePosition: true,
  //   })
  // }
}

export class SpotExchange extends BaseExchange {}
