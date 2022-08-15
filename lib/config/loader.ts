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
      // {
      //   symbol: 'SOL/USDT',
      //   exchange: 'binanceusdm',
      //   direction: 'long',
      //   dcaLevel: 4.3, // 4.5%
      //   dcaRate: 45, // 45%
      // },
      // {
      //   symbol: 'AVAX/BUSD',
      //   exchange: 'binanceusdm',
      //   direction: 'long',
      //   dcaLevel: 4.3, // 4.5%
      //   dcaRate: 42, // 45%
      // },
      {
        symbol: 'BTC/BUSD',
        exchange: 'binanceusdm',
        direction: 'short',
        dcaLevel: 3.4, // 1.5%
        dcaRate: 39, // 30%
        dcaMinContractCount: 0.001,
        dcaMaxContractCount: 0.05,
        maxTotalContractCount: 0.1,
      },
      // {
      //   symbol: 'SOL/BUSD',
      //   exchange: 'binanceusdm',
      //   direction: 'short',
      //   dcaLevel: 3, // 4.5%
      //   dcaRate: 40, // 45%
      // },
    ]

    pairs.forEach(pair => {
      let config = {
        maxLiquidPriceRatio: 2,
        maxTotalContractCount: 40,
        dcaLevel: 4.3, // 4.5%
        dcaRate: 45, // 45%
        dcaMinContractCount: 1,
        dcaMaxContractCount: 10,
        delay: 10,
      }
      config = Object.assign({}, config, pair)

      this.container.pairs.set(pair.symbol, new PairConfig(config))
    })
  }
}
