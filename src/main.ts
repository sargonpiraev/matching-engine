import { MatchingEngine } from './MatchingEngine'
import { OrderSide } from './types'

const matchingEngine = new MatchingEngine()

matchingEngine.createOrder({ id: '1', price: 1, side: OrderSide.ASK })
matchingEngine.createOrder({ id: '2', price: 1, side: OrderSide.BID })

matchingEngine.createOrder({ id: '3', price: 2, side: OrderSide.ASK })
matchingEngine.createOrder({ id: '4', price: 1, side: OrderSide.BID })
matchingEngine.createOrder({ id: '5', price: 3, side: OrderSide.BID })
