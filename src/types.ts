export enum OrderSide {
  ASK, // sell
  BID, // buy
}

export type Order = {
  id: string
  side: OrderSide
  price: number
}

export type Trade = {
  askOrderId: string
  bidOrderId: string
  price: number
}
