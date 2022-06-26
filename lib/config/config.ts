interface BaseConfigInterFace {}
export abstract class BaseConfig implements BaseConfigInterFace {
  constructor(args: any) {
    Object.assign(this, args)
  }
}
export class AppConfig extends BaseConfig {
  // misc
  public delay: number
}
export class ExchangeConfig extends BaseConfig {
  public identifier: string
  public apiKey: string
  public apiSecret: string
}
export class PairConfig extends BaseConfig {
  // safety check
  public maxLiquidPriceRatio: number
  public maxTotalContractCount: number
  // dca
  public dcaLevel: number
  public dcaRate: number
  public dcaMinContractCount: number
  public dcaMaxContractCount: number
  //pair
  public symbol: string
  public exchange: string
  public direction: string
}
