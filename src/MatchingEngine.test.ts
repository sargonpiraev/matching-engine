import assert from 'node:assert'
import { MatchingEngine } from './MatchingEngine'
import { randomUUID } from 'node:crypto'
import {
  LimitOrder,
  OrderSide,
  Trade,
  MarketOrder,
  OrderType,
  Order,
  MatchingAlgorithm,
} from './types'
import { TradingDisabledError } from './errors'

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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const order: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 2,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 2,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrderMinPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrderMaxPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 2,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrderOldest: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrderRecent: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 2,
      type: OrderType.LIMIT,
    }
    matchingEngine.match(bidOrderOldest)
    matchingEngine.match(bidOrderRecent)
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrderLowestPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrderBigestPrice: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 2,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrderOldest: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrderRecent: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 1,
      time: 2,
      type: OrderType.LIMIT,
    }
    matchingEngine.match(askOrderOldest)
    matchingEngine.match(askOrderRecent)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 10,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 5,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 5,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 10,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 12,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrder1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 5,
      time: 1,
      type: OrderType.LIMIT,
    }
    const askOrder2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 1,
      quantity: 10,
      time: 1,
      type: OrderType.LIMIT,
    }
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 12,
      time: 1,
      type: OrderType.LIMIT,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const askOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 100,
      quantity: 2,
      time: 1,
      type: OrderType.LIMIT,
    }
    const marketBidOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 2,
      time: 2,
      type: OrderType.MARKET,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const bidOrder: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 100,
      quantity: 2,
      time: 1,
      type: OrderType.LIMIT,
    }
    const marketAskOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      quantity: 2,
      time: 2,
      type: OrderType.MARKET,
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const ask1: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 100,
      quantity: 2,
      time: 1,
      type: OrderType.LIMIT,
    }
    const ask2: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.ASK,
      price: 101,
      quantity: 3,
      time: 2,
      type: OrderType.LIMIT,
    }
    matchingEngine.match(ask1)
    matchingEngine.match(ask2)

    const marketBid: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 3,
      time: 3,
      type: OrderType.MARKET,
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
      },
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
    const matchingEngine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const marketOrder: MarketOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      quantity: 1,
      time: 1,
      type: OrderType.MARKET,
    }
    // act
    const result = matchingEngine.match(marketOrder)
    // assert
    assert.deepEqual(result, [])
    assert.strictEqual(matchingEngine.bids.length, 0)
    assert.strictEqual(matchingEngine.asks.length, 0)
  })
})

describe('MatchingEngine Trading Status Tests', () => {
  test('should throw error when trading is disabled', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    engine.stopTrading()

    const order: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }

    assert.throws(() => engine.match(order), TradingDisabledError)
  })

  test('should allow trading after restart', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    engine.stopTrading()
    engine.startTrading()

    const order: LimitOrder = {
      id: randomUUID(),
      side: OrderSide.BID,
      price: 1,
      quantity: 1,
      time: 1,
      type: OrderType.LIMIT,
    }

    assert.doesNotThrow(() => engine.match(order))
  })
})

describe('Order Validation Tests', () => {
  const validOrderBase = {
    id: randomUUID(),
    side: OrderSide.BID,
    quantity: 1,
    time: Date.now(),
    type: OrderType.LIMIT,
    price: 100,
  }

  test('should throw validation error for missing id', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder = { ...validOrderBase, id: undefined as any } as Order

    assert.throws(() => engine.match(invalidOrder), {
      name: 'OrderValidationError',
      message: /id must be a UUID/,
    })
  })

  test('should throw validation error for invalid UUID', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder = { ...validOrderBase, id: 'invalid-uuid' } as Order

    assert.throws(() => engine.match(invalidOrder), {
      name: 'OrderValidationError',
      message: /id must be a UUID/,
    })
  })

  test('should throw validation error for invalid side', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder = { ...validOrderBase, side: 'INVALID_SIDE' as any }

    assert.throws(() => engine.match(invalidOrder as Order), {
      name: 'OrderValidationError',
      message: /side must be a valid enum value/,
    })
  })

  test('should throw validation error for non-positive quantity', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder = { ...validOrderBase, quantity: 0 }

    assert.throws(() => engine.match(invalidOrder as Order), {
      name: 'OrderValidationError',
      message: /quantity must be greater than or equal to 0\.00000001/,
    })
  })

  test('should throw validation error for missing price in limit order', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder: LimitOrder = {
      ...validOrderBase,
      type: OrderType.LIMIT,
      price: undefined as any,
    }

    assert.throws(() => engine.match(invalidOrder as Order), {
      name: 'OrderValidationError',
      message: /price must be a positive number/,
    })
  })

  test('should throw validation error for non-positive price in limit order', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const invalidOrder = { ...validOrderBase, price: -10 }

    assert.throws(() => engine.match(invalidOrder as Order), {
      name: 'OrderValidationError',
      message: /price must be a positive number/,
    })
  })

  test('should not require price for market order', () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRICE_TIME)
    const validMarketOrder: MarketOrder = {
      ...validOrderBase,
      type: OrderType.MARKET,
      price: undefined as any,
    }

    assert.doesNotThrow(() => engine.match(validMarketOrder))
  })
})

describe('Pro Rata Matching Algorithm', () => {
  test(`
    given
      two ASK orders with same price and different quantities
    when
      new BID order added
    then
      should match larger quantity first
  `, () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRO_RATA)
    const ask1 = createLimitAsk(100, 5) // quantity 5
    const ask2 = createLimitAsk(100, 10) // quantity 10
    const bid = createLimitBid(100, 15)

    engine.match(ask1)
    engine.match(ask2)
    const trades = engine.match(bid)

    assert.deepEqual(trades, [
      { bidOrderId: bid.id, askOrderId: ask2.id, price: 100, quantity: 10 },
      { bidOrderId: bid.id, askOrderId: ask1.id, price: 100, quantity: 5 },
    ])
  })

  test(`
    given
      two BID orders with same price and different quantities
    when
      new ASK order added
    then
      should match larger quantity first
  `, () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRO_RATA)
    const bid1 = createLimitBid(100, 3)
    const bid2 = createLimitBid(100, 7)
    const ask = createLimitAsk(100, 5)

    engine.match(bid1)
    engine.match(bid2)
    const trades = engine.match(ask)

    assert.deepEqual(trades, [{ bidOrderId: bid2.id, askOrderId: ask.id, price: 100, quantity: 5 }])
    assert.strictEqual(bid2.quantity, 2)
  })

  test(`
    given
      orders with same price and quantity
    when
      matching happens
    then
      should prioritize earlier orders
  `, () => {
    const engine = new MatchingEngine(MatchingAlgorithm.PRO_RATA)
    const ask1 = { ...createLimitAsk(100, 5), time: 1 }
    const ask2 = { ...createLimitAsk(100, 5), time: 2 }
    const bid = createLimitBid(100, 10)

    engine.match(ask1)
    engine.match(ask2)
    const trades = engine.match(bid)

    assert.deepEqual(trades, [
      { bidOrderId: bid.id, askOrderId: ask1.id, price: 100, quantity: 5 },
      { bidOrderId: bid.id, askOrderId: ask2.id, price: 100, quantity: 5 },
    ])
  })
})

// Хелпер-функции для создания ордеров
function createLimitAsk(price: number, quantity: number): LimitOrder {
  return {
    id: randomUUID(),
    side: OrderSide.ASK,
    price,
    quantity,
    time: Date.now(),
    type: OrderType.LIMIT,
  }
}

function createLimitBid(price: number, quantity: number): LimitOrder {
  return {
    id: randomUUID(),
    side: OrderSide.BID,
    price,
    quantity,
    time: Date.now(),
    type: OrderType.LIMIT,
  }
}
