import assert from 'node:assert'
import { MatchingEngine } from './MatchingEngine'
import { randomUUID } from 'node:crypto'
import { LimitOrder, OrderSide, Trade, MarketOrder } from './types'

describe('MarchingEngine Tests', () => {
  test(`
    given
      there are no orders
    when
      new order added
    then
      no trade should happen and
      order should be added to orders
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const order: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    // act
    const result = matchingEngine.match(order)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.bids.length, 1)
  })

  test(`
    given
      there is one bid order
    when
      new bid order added
    then
      no trade should happen and
      order should be added to bids
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const bidOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder1)
    // act
    const result = matchingEngine.match(bidOrder2)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.bids.length, 2)
  })

  test(`
    given
      there is one ask order
    when
      new ask order added
    then
      no trade should happen and
      order should be added to asks
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const askOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(askOrder1)
    // act
    const result = matchingEngine.match(askOrder2)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.asks.length, 2)
  })

  test(`
    given
      there is one bid order
    when
      new ask order added and
      new ask order price is bigger bid order price
    then
      trade should not happen and
      new ask order should be added to orders
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 2,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.bids.length, 1)
    assert.strictEqual(matchingEngine.asks.length, 1)
  })

  test(`
    given
      there is one bid order
    when
      new ask order added and
      new ask order price and bid order price are same
    then
      trade should happen and
      trade price should be bid order price and
      no order should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: 1, quantity: 1 }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })

  test(`
    given
      there is one bid order
    when
      new ask order added and
      new ask order price is less than bid order price
    then
      trade should happen and
      trade price should be bid order price and
      no order should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 2,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder.id,
      price: bidOrder.price,
      quantity: 1,
    }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })

  test(`
    given
      there are two bid orders and
      one bid order price is higher
    when
      new ask order added and
      new ask order price greater than highest bid order price
    then
      trade should happen and
      price should be the highest bid order price and
      bid order with less price should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrderMinPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const bidOrderMaxPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 2,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrderMinPrice)
    matchingEngine.match(bidOrderMaxPrice)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = {
      bidOrderId: bidOrderMaxPrice.id,
      askOrderId: askOrder.id,
      price: bidOrderMaxPrice.price,
      quantity: 1,
    }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 1)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })

  test(`
    given
      there are two bid orders and
      bid orders have same price and
      one bid order was added before the another
    when
      new ask order added and
      new ask order price greater than highest bid order price
    then
      trade should happen and
      price should be the highest bid order price and
      bid order created earlier should be matched and
      bid order created later should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrderOldest: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const bidOrderRecent: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 2,
      type: 'limit',
    }
    matchingEngine.match(bidOrderOldest)
    matchingEngine.match(bidOrderRecent)
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = {
      bidOrderId: bidOrderOldest.id,
      askOrderId: askOrder.id,
      price: bidOrderOldest.price,
      quantity: 1,
    }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 1)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })

  test(`
    given
      there are two ask orders and
      one ask order price is higher
    when
      new bid order added and
      new bid order price less than highest ask order price
    then
      trade should happen and
      price should be the bid order price and
      ask order with highest price should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const askOrderLowestPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrderBigestPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 2,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(askOrderLowestPrice)
    matchingEngine.match(askOrderBigestPrice)
    // act
    const result = matchingEngine.match(bidOrder)
    // assert
    const trade: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: askOrderLowestPrice.id,
      price: bidOrder.price,
      quantity: 1,
    }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.asks.length, 1)
    assert.strictEqual(matchingEngine.bids.length, 0)
  })

  test(`
    given
      there are two ask orders and
      ask orders have same price and
      one ask order was added before the another
    when
      new bid order added and
      new bid order price less than highest ask order price
    then
      trade should happen and
      price should be the bid order price and
      ask order created earlier should be matched and
      ask order created later should be in orders in the end
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const askOrderOldest: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    const askOrderRecent: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 2,
      type: 'limit',
    }
    matchingEngine.match(askOrderOldest)
    matchingEngine.match(askOrderRecent)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: 'limit',
    }
    // act
    const result = matchingEngine.match(bidOrder)
    // assert
    const trade: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: askOrderOldest.id,
      price: bidOrder.price,
      quantity: 1,
    }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 1)
  })

  test(`
    given
      there is one bid order with quantity 10
    when
      new ask order added with quantity 5 and
      ask order price matches bid order price
    then
      trade should happen for quantity 5 and
      remaining quantity of bid order should be 5
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 10,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 5,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: 1, quantity: 5 }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 1)
    assert.strictEqual(matchingEngine.asks.length, 0)
    assert.strictEqual(matchingEngine.bids[0].quantity, 5)
  })

  test(`
    given
      there is one ask order with quantity 10
    when
      new bid order added with quantity 5 and
      bid order price matches ask order price
    then
      trade should happen for quantity 5 and
      remaining quantity of ask order should be 5
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: 'limit',
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(askOrder)
    // act
    const result = matchingEngine.match(bidOrder)
    // assert
    const trade: Trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: 1, quantity: 5 }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.asks.length, 1)
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks[0].quantity, 5)
  })

  test(`
    given
      there is one bid order with quantity 5
    when
      new ask order added with quantity 10 and
      ask order price matches bid order price
    then
      trade should happen for quantity 5 and
      remaining quantity of ask order should be 5
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade: Trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: 1, quantity: 5 }
    assert.deepEqual(result, [trade])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 1)
    assert.strictEqual(matchingEngine.asks[0].quantity, 5)
  })

  test(`
    given
      there are two bid orders with quantities 5 and 10 respectively
    when
      new ask order added with quantity 12 and
      ask order price matches bid order prices
    then
      trade should happen for quantity 12 and
      first bid order should fully execute and
      second bid order should have remaining quantity 3
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const bidOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: 'limit',
    }
    const bidOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 10,
      time: 1,
      type: 'limit',
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 12,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(bidOrder1)
    matchingEngine.match(bidOrder2)
    // act
    const result = matchingEngine.match(askOrder)
    // assert
    const trade1: Trade = {
      bidOrderId: bidOrder1.id,
      askOrderId: askOrder.id,
      price: 1,
      quantity: 5,
    }
    const trade2: Trade = {
      bidOrderId: bidOrder2.id,
      askOrderId: askOrder.id,
      price: 1,
      quantity: 7,
    }
    assert.deepEqual(result, [trade1, trade2])
    assert.strictEqual(matchingEngine.bids.length, 1)
    assert.strictEqual(matchingEngine.bids[0].quantity, 3)
  })

  test(`
    given
      there are two ask orders with quantities 5 and 10 respectively
    when
      new bid order added with quantity 12 and
      bid order price matches ask order prices
    then
      trade should happen for quantity 12 and
      first ask order should fully execute and
      second ask order should have remaining quantity 3
  `, () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const askOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 5,
      time: 1,
      type: 'limit',
    }
    const askOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: 'limit',
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 12,
      time: 1,
      type: 'limit',
    }
    matchingEngine.match(askOrder1)
    matchingEngine.match(askOrder2)
    // act
    const result = matchingEngine.match(bidOrder)
    // assert
    const trade1: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder1.id,
      price: 1,
      quantity: 5,
    }
    const trade2: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: askOrder2.id,
      price: 1,
      quantity: 7,
    }
    assert.deepEqual(result, [trade1, trade2])
    assert.strictEqual(matchingEngine.asks.length, 1)
    assert.strictEqual(matchingEngine.asks[0].quantity, 3)
  })

  test(`
    given
      there is one ask limit order
    when
      new market bid order added
    then
      trade should happen at ask order price and
      ask order should be removed
  `, () => {
    // assign
    const matchingEngine = new MatchingEngine()
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 100,
      quantity: 2,
      time: 1,
      type: 'limit',
    }
    const marketBidOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 2,
      time: 2,
      type: 'market',
    }
    matchingEngine.match(askOrder)
    // act
    const result = matchingEngine.match(marketBidOrder)
    // assert
    const expectedTrade: Trade = {
      bidOrderId: marketBidOrder.id,
      askOrderId: askOrder.id,
      price: askOrder.price,
      quantity: 2,
    }
    assert.deepEqual(result, [expectedTrade])
    assert.strictEqual(matchingEngine.asks.length, 0)
  })

  test(`
    given
      there is one bid limit order
    when
      new market ask order added
    then
      trade should happen at bid order price and
      bid order should be removed
  `, () => {
    // assign
    const matchingEngine = new MatchingEngine()
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 100,
      quantity: 2,
      time: 1,
      type: 'limit',
    }
    const marketAskOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      quantity: 2,
      time: 2,
      type: 'market',
    }
    matchingEngine.match(bidOrder)
    // act
    const result = matchingEngine.match(marketAskOrder)
    // assert
    const expectedTrade: Trade = {
      bidOrderId: bidOrder.id,
      askOrderId: marketAskOrder.id,
      price: bidOrder.price,
      quantity: 2,
    }
    assert.deepEqual(result, [expectedTrade])
    assert.strictEqual(matchingEngine.bids.length, 0)
  })

  test(`
    given
      there are multiple ask limit orders
    when
      new market bid order added with partial quantity
    then
      should execute against best price first
  `, () => {
    // assign
    const matchingEngine = new MatchingEngine()
    const ask1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 100,
      quantity: 2,
      time: 1,
      type: 'limit',
    }
    const ask2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 101,
      quantity: 3,
      time: 2,
      type: 'limit',
    }
    matchingEngine.match(ask1)
    matchingEngine.match(ask2)
    
    const marketBid: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 3,
      time: 3,
      type: 'market',
    }
    // act
    const result = matchingEngine.match(marketBid)
    // assert
    const expectedTrades = [
      {
        bidOrderId: marketBid.id,
        askOrderId: ask1.id,
        price: ask1.price,
        quantity: 2,
      },
      {
        bidOrderId: marketBid.id,
        askOrderId: ask2.id,
        price: ask2.price,
        quantity: 1,
      }
    ]
    assert.deepEqual(result, expectedTrades)
    assert.strictEqual(matchingEngine.asks.length, 1)
    assert.strictEqual(matchingEngine.asks[0].quantity, 2)
  })

  test(`
    given
      no matching orders in book
    when
      new market order added
    then
      should not execute and not be added to book
  `, () => {
    // assign
    const matchingEngine = new MatchingEngine()
    const marketOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 1,
      time: 1,
      type: 'market',
    }
    // act
    const result = matchingEngine.match(marketOrder)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })
})
