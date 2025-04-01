import { MatchingEngine } from './MatchingEngine'
import { OrderSide } from './types'

const matchingEngine = new MatchingEngine()

matchingEngine.addOrder({ id: '1', price: 1, side: OrderSide.ASK, quantity: 1, time: 1 })
matchingEngine.addOrder({ id: '2', price: 1, side: OrderSide.BID, quantity: 1, time: 1 })

matchingEngine.addOrder({ id: '3', price: 2, side: OrderSide.ASK, quantity: 1, time: 1 })
matchingEngine.addOrder({ id: '4', price: 1, side: OrderSide.BID, quantity: 1, time: 1 })
matchingEngine.addOrder({ id: '5', price: 3, side: OrderSide.BID, quantity: 1, time: 1 })
