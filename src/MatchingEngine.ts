import { Order, OrderSide, Trade } from './types'

// one trading instrument
// no performance optimisations
// only limit orders
// trade gets bid price
export class MatchingEngine {
  private orders: Order[] = []

  public addOrder(order: Order): Trade[] {
    this.orders.push(order)
    return this.match()
  }

  public get bids() {
    return this.orders
      .filter((order) => order.side === OrderSide.BID)
      .sort((a: Order, b: Order) => a.price - b.price)
  }

  public get asks() {
    return this.orders
      .filter((order) => order.side === OrderSide.ASK)
      .sort((a: Order, b: Order) => b.price - a.price)
  }

  private deleteOrder(orderId: Order['id']) {
    this.orders = this.orders.filter((x) => x.id !== orderId)
  }

  private reduceOrderQuantity(order: Order, quantity: number) {
    order.quantity -= quantity
    if (order.quantity > 0) return
    this.deleteOrder(order.id)
  }

  private match(): Trade[] {
    if (!this.asks.length || !this.bids.length) return []

    const [minPriceAskOrder] = this.asks
    const [maxPriceBidOrder] = this.bids

    if (minPriceAskOrder.price > maxPriceBidOrder.price) return []

    const trade: Trade = {
      askOrderId: minPriceAskOrder.id,
      bidOrderId: maxPriceBidOrder.id,
      price: maxPriceBidOrder.price,
      quantity: Math.min(minPriceAskOrder.quantity, maxPriceBidOrder.quantity),
    }

    this.reduceOrderQuantity(minPriceAskOrder, trade.quantity)
    this.reduceOrderQuantity(maxPriceBidOrder, trade.quantity)

    return [trade, ...this.match()]
  }
}
