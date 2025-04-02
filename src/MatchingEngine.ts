import { LimitOrder, MarketOrder, Order, OrderSide, OrderType, Trade } from './types'
import { validateOrReject, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { OrderDto } from './order.dto';
import { OrderValidationError, TradingDisabledError } from './errors';

// one trading instrument
// no performance optimisations
// only limit and market orders
// trade gets bid price
export class MatchingEngine {
  private orders: LimitOrder[] = []
  private isTradingActive = true

  // Добавляем методы управления торговлей
  stopTrading() {
    this.isTradingActive = false
  }

  startTrading() {
    this.isTradingActive = true
  }

  match(order: Order): Trade[] {
    if (!this.isTradingActive) {
      throw new TradingDisabledError()
    }
    this.validateOrder(order);
    const trades = this.matchOrderType(order);
    if (order.type === OrderType.MARKET) return trades;
    if (order.quantity) this.orders.push(order);
    return trades;
  }

  matchOrderType(order: Order): Trade[] {
    return order.type === OrderType.MARKET
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

  private reduceExistingOrderQuantity(order: Order, quantity: number) {
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

  private updateQuantities(order: Order, existingOrder: Order, quantity: number) {
    order.quantity -= quantity
    this.reduceExistingOrderQuantity(existingOrder, quantity)
  }

  private validateOrder(order: Order) {
    const orderDto = plainToInstance(OrderDto, order);
    const errors = validateSync(orderDto);
    if (errors.length > 0) {
      const errorMessages = errors.flatMap(error => Object.values(error.constraints || {}));
      throw new OrderValidationError(errorMessages.join('; '));
    }
  }
}
