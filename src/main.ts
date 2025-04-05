import { MatchingEngine } from './MatchingEngine'
import { OrderSide, OrderType } from './types'

const matchingEngine = new MatchingEngine()

matchingEngine.match({ id: '1', price: 1, side: OrderSide.ASK, quantity: 1, time: 1, type: OrderType.LIMIT })
matchingEngine.match({ id: '2', price: 1, side: OrderSide.BID, quantity: 1, time: 1, type: OrderType.LIMIT })

matchingEngine.match({ id: '3', price: 2, side: OrderSide.ASK, quantity: 1, time: 1, type: OrderType.LIMIT })
matchingEngine.match({ id: '4', price: 1, side: OrderSide.BID, quantity: 1, time: 1, type: OrderType.LIMIT })
matchingEngine.match({ id: '5', price: 3, side: OrderSide.BID, quantity: 1, time: 1, type: OrderType.LIMIT })
