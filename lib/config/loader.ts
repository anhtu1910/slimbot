import { AppConfig, ExchangeConfig, PairConfig } from './config'
import { ConfigContainer } from './container'

export class ConfigLoader {
  static container: ConfigContainer
  static load() {
    if (!this.container) {
      this.container = new ConfigContainer()
      this.initApp()
      this.initExchanges()
      this.initPairs()
    }

    return this.container
  }
  static initApp() {
    this.container.app = new AppConfig({
      delay: 10,
    })
  }
  static initExchanges() {
    // TODO: load these config from files
    this.container.exchanges.set(
      'binanceusdm',
      new ExchangeConfig({
        apiKey: process.env.EXCHANGE_KEY,
        apiSecret: process.env.EXCHANGE_SECRET,
      })
    )
  }
  static initPairs() {
    // TODO: load these config from files
    let pairs = [
      {
        symbol: 'SOL/USDT',
        exchange: 'binanceusdm',
        direction: 'long',
      },
      {
        symbol: 'AVAX/USDT',
        exchange: 'binanceusdm',
        direction: 'long',
      },
      {
        symbol: 'SOL/BUSD',
        exchange: 'binanceusdm',
        direction: 'short',
      },
    ]

    pairs.forEach(pair => {
      let pairConfig = new PairConfig({
        maxLiquidPriceRatio: 2,
        maxTotalContractCount: 40,
        dcaLevel: 4.3, // 4.5%
        dcaRate: 36, // 36%
        dcaMinContractCount: 1,
        dcaMaxContractCount: 10,
        delay: 10,
        symbol: pair.symbol,
        exchange: pair.exchange,
        direction: pair.direction,
      })

      this.container.pairs.set(pair.symbol, pairConfig)
    })
  }
}
