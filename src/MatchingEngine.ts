import { LimitOrder, MarketOrder, Order, OrderSide, Trade } from './types'

// one trading instrument
// no performance optimisations
// only limit and market orders
// trade gets bid price
export class MatchingEngine {
  private orders: LimitOrder[] = []

  public match(order: Order): Trade[] {
    const trades = this.matchOrderType(order);
    if (order.type === 'market') return trades;
    if (order.quantity) this.orders.push(order);
    return trades;
  }

  matchOrderType(order: Order): Trade[] {
    return order.type === 'market'
      ? this.matchMarketOrder(order)
      : this.matchLimitOrder(order)
  }

  public get bids() {
    return this.orders
      .filter((order) => order.side === OrderSide.BID)
      .sort((a, b) => b.price - a.price || a.time - b.time)
  }

  public get asks() {
    return this.orders
      .filter((order) => order.side === OrderSide.ASK)
      .sort((a, b) => a.price - b.price || a.time - b.time)
  }

  private deleteOrder(orderId: Order['id']) {
    this.orders = this.orders.filter((x) => x.id !== orderId)
  }

  private matchMarketOrder(order: MarketOrder): Trade[] {
    return order.side === OrderSide.BID
      ? this.matchMarketBid(order)
      : this.matchMarketAsk(order)
  }

  private matchLimitOrder(order: LimitOrder): Trade[] {
    return order.side === OrderSide.BID
      ? this.matchLimitBid(order)
      : this.matchLimitAsk(order)
  }

  private reduceOrderQuantity(order: Order, quantity: number) {
    order.quantity -= quantity
    if (order.quantity > 0) return
    this.deleteOrder(order.id)
  }

  private matchLimitBid(order: LimitOrder): Trade[] {
    if (order.quantity <= 0) return []
    const bestAsk = this.asks[0]
    if (!bestAsk || order.price < bestAsk.price) return []
    const trade = this.createLimitBidTrade(order, bestAsk)
    this.updateQuantities(order, bestAsk, trade.quantity)
    return [trade, ...this.matchLimitBid(order)]
  }

  private matchLimitAsk(order: LimitOrder): Trade[] {
    if (order.quantity <= 0) return []
    const bestBid = this.bids[0]
    if (!bestBid || order.price > bestBid.price) return []
    const trade = this.createLimitAskTrade(order, bestBid)
    this.updateQuantities(order, bestBid, trade.quantity)
    return [trade, ...this.matchLimitAsk(order)]
  }

  private matchMarketBid(order: MarketOrder): Trade[] {
    if (order.quantity <= 0) return []
    const bestAsk = this.asks[0]
    if (!bestAsk) return []
    const trade = this.createMarketBidTrade(order, bestAsk)
    this.updateQuantities(order, bestAsk, trade.quantity)
    return [trade, ...this.matchMarketBid(order)]
  }

  private matchMarketAsk(order: MarketOrder): Trade[] {
    if (order.quantity <= 0) return []
    const bestBid = this.bids[0]
    if (!bestBid) return []
    const trade = this.createMarketAskTrade(order, bestBid)
    this.updateQuantities(order, bestBid, trade.quantity)
    return [trade, ...this.matchMarketAsk(order)]
  }

  private createLimitBidTrade(bidOrder: LimitOrder, askOrder: LimitOrder): Trade {
    return {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder.id,
      price: askOrder.price,
      quantity: Math.min(bidOrder.quantity, askOrder.quantity),
    };
  }

  private createLimitAskTrade(askOrder: LimitOrder, bidOrder: LimitOrder): Trade {
    return {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder.id,
      price: bidOrder.price,
      quantity: Math.min(askOrder.quantity, bidOrder.quantity),
    };
  }

  private createMarketBidTrade(bidOrder: MarketOrder, askOrder: LimitOrder): Trade {
    return {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder.id,
      price: askOrder.price,
      quantity: Math.min(bidOrder.quantity, askOrder.quantity),
    };
  }

  private createMarketAskTrade(askOrder: MarketOrder, bidOrder: LimitOrder): Trade {
    return {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder.id,
      price: bidOrder.price,
      quantity: Math.min(askOrder.quantity, bidOrder.quantity),
    };
  }

  private updateQuantities(order: Order, oppositeOrder: Order, quantity: number) {
    order.quantity -= quantity
    this.reduceOrderQuantity(oppositeOrder, quantity)
  }
}
