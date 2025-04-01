export enum OrderSide {
  ASK, // sell
  BID, // buy
}

export type BaseOrder = {
  id: string
  side: OrderSide
  quantity: number
  time: number
}

export type MarketOrder = BaseOrder & {
  type: 'market'
}

export type LimitOrder = BaseOrder & {
  type: 'limit'
  price: number
}

export type Order = LimitOrder | MarketOrder;

export type Trade = {
  askOrderId: string
  bidOrderId: string
  price: number
  quantity: number
}
