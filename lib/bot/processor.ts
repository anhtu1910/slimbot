import { PairConfig } from '../config/config'
import { ConfigContainer } from '../config/container'
import { ConfigLoader } from '../config/loader'
import { ExchangeLoader } from '../exchange/loader'
import { Log } from '../helper/log'
import Worker from './worker'

export default class Processor {
  private config: ConfigContainer
  constructor() {
    this.config = ConfigLoader.load()
  }
  private cycle: number = 0
  start() {
    Log.info(Object.fromEntries(this.config.pairs))

    setInterval(
      (async () => {
        this.cycle++
        Log.info(`NOTICE: PROCESSING #${this.cycle}`)
        await this.process()
        console.log(`PROCESSED #${this.cycle}`, new Date().toString())
      }).bind(this),
      this.config.app.delay * 1000
    )
  }
  async process() {
    for (let pairConfig of this.config.pairs) {
      let config = pairConfig[1]
      await this.processPair(config)
    }
  }
  async processPair(config: PairConfig) {
    let exchange = ExchangeLoader.load(config.exchange)
    if (exchange) {
      let worker = new Worker(exchange, config)
      await worker.start()
    }
  }
}
