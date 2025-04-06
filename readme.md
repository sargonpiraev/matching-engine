# Matching Engine

A simple yet robust order matching engine implementation for financial markets, supporting basic limit and market orders with price-time priority matching.

## Key Features

- **Order Types Supported**
  - Limit Orders
  - Market Orders
  - Immediate-or-Cancel (IOC) semantics for unfilled quantities

- **Matching Logic**
  - Price-time priority execution
  - Bid/Ask sorting:
    - Bids sorted descending by price (best bid first)
    - Asks sorted ascending by price (best ask first)
    - Time priority for same-priced orders
  - Partial fills supported

- **Order Book Management**
  - Maintains separate bid/ask queues
  - Automatic removal of filled orders
  - Quantity reduction for partial fills

- **Validation**
  - Order validation using class-validator
  - Rejects invalid orders with specific error messages
  - Trading session control (start/stop trading)

## Order Matching Rules

### Limit Orders
- Resting orders added to book if not immediately matchable
- Bid matches when bid price ≥ best ask price
- Ask matches when ask price ≤ best bid price
- Matches at existing order's price (taker price)

### Market Orders
- Immediately matches against best available prices
- Never added to order book
- Bid matches against best ask
- Ask matches against best bid

### Execution Priorities
1. Price priority
2. Time priority (earlier orders first)

## Example Usage

```typescript
import { MatchingEngine, OrderSide, OrderType } from './MatchingEngine'

const engine = new MatchingEngine()

// Add limit order
engine.match({
  id: '1',
  price: 100,
  side: OrderSide.BID,
  quantity: 5,
  time: Date.now(),
  type: OrderType.LIMIT
})

// Add market order
const trades = engine.match({
  id: '2',
  side: OrderSide.ASK,
  quantity: 3,
  time: Date.now(),
  type: OrderType.MARKET
})
```

## Current Limitations
- Single instrument only
- No advanced order types (stop orders, etc.)
- No persisted order book
- No performance optimizations
- No spread calculation helpers
- No market data feeds

## Error Handling
The engine throws specific errors for:
- Order validation failures (`OrderValidationError`)
- Trading while disabled (`TradingDisabledError`)

## Testing
Comprehensive test suite covering:
- Basic matching scenarios
- Partial fills
- Price-time priority
- Market order execution
- Error conditions
- Order book state management

Run tests: `npm test:unit`

## Potential Enhancements and Feature Roadmap

### Advanced Order Types
  - [ ] Stop-Loss orders
  - [ ] Take-Profit orders
  - [ ] Trailing Stop orders
  - [ ] Iceberg orders (hidden quantity)
  - [ ] Fill-or-Kill (FOK) execution

### Order Management
  - [ ] Order cancellation by ID
  - [ ] Order modification support
  - [ ] Time-in-Force (TTL) for orders
  - [ ] Conditional orders (based on market triggers)

### Performance Optimizations
  - [ ] Binary heap implementation for price levels
  - [ ] Order ID indexing for fast lookups
  - [ ] Batch order processing
  - [ ] Order book snapshot caching

### Market Data & Analytics
  - [ ] Real-time spread calculation
  - [ ] Depth of Market (DOM) visualization
  - [ ] Trade history persistence
  - [ ] Volume-Weighted Average Price (VWAP)

### System Integrations
  - [ ] WebSocket API for real-time updates
  - [ ] FIX protocol support
  - [ ] Plugin architecture for extensions
  - [ ] Market data simulator

### Core Engine Improvements
  - [ ] Multi-instrument support
  - [ ] Auction mode implementation
  - [ ] Backtesting framework
  - [ ] Role-based access control
  - [ ] Audit trail and event logging

