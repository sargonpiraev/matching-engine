export enum OrderSide {
  ASK, // sell
  BID, // buy
}

export enum OrderType {
  LIMIT,
  MARKET,
  // STOP_LIMIT,
  // ICEBERG,
}

export type BaseOrder = {
  id: string
  side: OrderSide
  quantity: number
  time: number
}

export type MarketOrder = BaseOrder & {
  type: OrderType.MARKET
  price?: never
}

export type LimitOrder = BaseOrder & {
  type: OrderType.LIMIT
  price: number
}

export type Order = LimitOrder | MarketOrder

export type Trade = {
  askOrderId: string
  bidOrderId: string
  price: number
  quantity: number
}

export enum MatchingAlgorithm {
  PRICE_TIME,
  PRO_RATA,
}
