import assert from 'node:assert'
import { MatchingEngine } from './MatchingEngine'
import { randomUUID } from 'node:crypto'
import { Order, OrderSide } from './types'

describe('MarchingEngine Tests', () => {
  test('#createOrder', () => {
    //assign
    const matchingEngine = new MatchingEngine()
    const order: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
    // act
    matchingEngine.createOrder(order)
    // assert
    assert.strictEqual(matchingEngine.orders.length, 1)
  })

  describe('#match', () => {
    test(`
      given
        there are no orders and
      when
        new order added
      then
        no trade should happen and
        order should be added to orders
    `, () => {
      //assign
      const matchingEngine = new MatchingEngine()
      const order: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      // act
      const result = matchingEngine.createOrder(order)
      // assert
      assert.strictEqual(result, undefined)
      assert.strictEqual(matchingEngine.orders.length, 1)
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
      const order1: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      const order2: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      matchingEngine.createOrder(order1)
      // act
      const result = matchingEngine.createOrder(order2)
      // assert
      assert.strictEqual(result, undefined)
      assert.strictEqual(matchingEngine.orders.length, 2)
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
      const order1: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      const order2: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      matchingEngine.createOrder(order1)
      // act
      const result = matchingEngine.createOrder(order2)
      // assert
      assert.strictEqual(result, undefined)
      assert.strictEqual(matchingEngine.orders.length, 2)
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
      const bidOrder: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      const askOrder: Order = { id: randomUUID(), side: OrderSide.ASK, price: 2 }
      matchingEngine.createOrder(bidOrder)
      // act
      const result = matchingEngine.createOrder(askOrder)
      // assert
      assert.strictEqual(result, undefined)
      assert.strictEqual(matchingEngine.orders.length, 2)
    })

    test(`
      given
        there is one bid order
      when
        new ask order added and
        new ask order price and bid order price are same
      then
        trade should happen and
        no orders should be in orders in the end
    `, () => {
      //assign
      const matchingEngine = new MatchingEngine()
      const bidOrder: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      const askOrder: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      matchingEngine.createOrder(bidOrder)
      // act
      const result = matchingEngine.createOrder(askOrder)
      // assert
      const trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: 1 }
      assert.deepEqual(result, trade)
      assert.strictEqual(matchingEngine.orders.length, 0)
    })

    test(`
      given
        there is one bid order
      when
        new ask order added and
        new ask order price is less than bid order price
      then
        trade should happen and
        price should be bid order price
        no orders should be in orders in the end
    `, () => {
      //assign
      const matchingEngine = new MatchingEngine()
      const bidOrder: Order = { id: randomUUID(), side: OrderSide.BID, price: 2 }
      const askOrder: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      matchingEngine.createOrder(bidOrder)
      // act
      const result = matchingEngine.createOrder(askOrder)
      // assert
      const trade = { bidOrderId: bidOrder.id, askOrderId: askOrder.id, price: bidOrder.price }
      assert.deepEqual(result, trade)
      assert.strictEqual(matchingEngine.orders.length, 0)
    });

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
      const bidOrderLowPrice: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      const bidOrderHighPrice: Order = { id: randomUUID(), side: OrderSide.BID, price: 2 }
      const askOrder: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      matchingEngine.createOrder(bidOrderLowPrice)
      matchingEngine.createOrder(bidOrderHighPrice)
      // act
      const result = matchingEngine.createOrder(askOrder)
      // assert
      const trade = { bidOrderId: bidOrderHighPrice.id, askOrderId: askOrder.id, price: bidOrderHighPrice.price }
      assert.deepEqual(result, trade)
      assert.strictEqual(matchingEngine.orders.length, 1);
    });

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
      const askOrderLowestPrice: Order = { id: randomUUID(), side: OrderSide.ASK, price: 1 }
      const askOrderBigestPrice: Order = { id: randomUUID(), side: OrderSide.ASK, price: 2 }
      const bidOrder: Order = { id: randomUUID(), side: OrderSide.BID, price: 1 }
      matchingEngine.createOrder(askOrderLowestPrice)
      matchingEngine.createOrder(askOrderBigestPrice)
      // act
      const result = matchingEngine.createOrder(bidOrder)
      // assert
      const trade = { bidOrderId: bidOrder.id, askOrderId: askOrderLowestPrice.id, price: bidOrder.price }
      assert.deepEqual(result, trade)
      assert.strictEqual(matchingEngine.orders.length, 1);
    })
  })
})
