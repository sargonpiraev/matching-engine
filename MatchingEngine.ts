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

  get bids() {
    return this.orders.filter(order => order.side === OrderSide.BID);
  }

  get asks() {
    return this.orders.filter((order) => order.side === OrderSide.ASK);
  }

  createOrder(order: Order) {
    this.orders.push(order);
    this.match();
  }

  deleteOrder(order: Order) {
    this.orders = this.orders.filter(x => x.id !== order.id);
  }

  match() {
    if (!this.asks.length || !this.bids.length) return;
    const minPriceAskOrder = this.asks.sort(sortByPriceMinToMax)[0];
    const maxPriceBidOrder = this.bids.sort(sortByPriceMaxToMin)[0];
    if (minPriceAskOrder.price > maxPriceBidOrder.price) return;
    const askOrderId = minPriceAskOrder.id;
    const bidOrderId = maxPriceBidOrder.id;
    const tradePrice = Math.max(minPriceAskOrder.price, maxPriceBidOrder.price);
    const trade: Trade = { askOrderId, bidOrderId, price: tradePrice };
    this.deleteOrder(minPriceAskOrder);
    this.deleteOrder(maxPriceBidOrder);
    console.log(trade);
  }
}
