export enum OrderSide {
  ASK, // sell
  BID, // buy
};

export type Order = {
  id: string;
  side: OrderSide;
  price: number;
}

export type Trade = {
  askOrderId: string;
  bidOrderId: string;
  price: number;
}

const sortByPriceMaxToMin = (a: Order, b: Order) => b.price - a.price;
const sortByPriceMinToMax = (a: Order, b: Order) => a.price - b.price;


// one trading instrument
// no performance optimisations
// only limit orders
// only full execution
// max price wins
export class MatchingEngine {
  public orders: Order[] = [];

  public createOrder(order: Order) {
    this.orders.push(order);
    this.match();
  }

  private getSideOrders(side: OrderSide): Order[] {
    return this.orders.filter(order => order.side === side);
  }

  private deleteOrder(orderId: Order['id']) {
    this.orders = this.orders.filter(x => x.id !== orderId);
  }

  private match() {
    const asks = this.getSideOrders(OrderSide.ASK);
    const bids = this.getSideOrders(OrderSide.BID);
    if (!asks.length || !bids.length) return;
    const [minPriceAskOrder] = asks.sort(sortByPriceMinToMax);
    const [maxPriceBidOrder] = bids.sort(sortByPriceMaxToMin);
    if (minPriceAskOrder.price > maxPriceBidOrder.price) return;
    const askOrderId = minPriceAskOrder.id;
    const bidOrderId = maxPriceBidOrder.id;
    const tradePrice = Math.max(minPriceAskOrder.price, maxPriceBidOrder.price);
    const trade: Trade = { askOrderId, bidOrderId, price: tradePrice };
    this.deleteOrder(minPriceAskOrder.id);
    this.deleteOrder(maxPriceBidOrder.id);
    console.log(trade);
  }
}
