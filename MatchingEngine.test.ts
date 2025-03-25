import test, {  } from 'node:test';
import assert from 'node:assert';
import {MatchingEngine, Order, OrderSide} from "./MatchingEngine";
import {randomUUID} from "node:crypto";

test.describe('MarchingEngine Tests', () => {

  test.test('#createOrder', () => {
    //assign
    const matchingEngine = new MatchingEngine();
    const order: Order = {id: randomUUID(), side: OrderSide.BID, price: 1};
    // act
    matchingEngine.createOrder(order);
    // assert
    assert(matchingEngine.orders.length === 1);
    assert.strictEqual(matchingEngine.orders[0], order);
  });

});
