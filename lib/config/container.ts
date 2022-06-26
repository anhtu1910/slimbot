import { AppConfig, ExchangeConfig, PairConfig } from './config'

export class ConfigContainer {
  app: AppConfig
  exchanges: Map<string, ExchangeConfig>
  pairs: Map<string, PairConfig>
  constructor() {
    this.exchanges = new Map()
    this.pairs = new Map()
  }
}
