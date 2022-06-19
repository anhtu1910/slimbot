export class Config {
  public apiKey: string | undefined
  public secret: string | undefined
  public pairs: Array<string>
  public tradingLimit: number

  // safety check
  public maxLiquidPriceRatio: number
  public maxTotalContractCount: number

  // dca
  public dcaLevel: number
  public dcaRate: number
  public dcaMinContractCount: number
  public dcaMaxContractCount: number

  // misc
  public delay: number

  constructor() {
    this.apiKey = process.env.EXCHANGE_KEY
    this.secret = process.env.EXCHANGE_SECRET
    this.pairs = ['SOL/BUSD'] // TODO: load from config file
    this.tradingLimit = 40 // TODO: load from config file

    this.maxLiquidPriceRatio = 2
    this.maxTotalContractCount = 30

    this.dcaLevel = 3.6 // %
    this.dcaRate = 36 // %
    this.dcaMinContractCount = 3
    this.dcaMaxContractCount = 10

    this.delay = 10
  }
}
