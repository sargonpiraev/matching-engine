# Matching Engine

A simple yet robust order matching engine implementation for financial markets, supporting limit/market orders with price-time and pro-rata matching algorithms.

## Key Features

- **Supported Order Types**
  - Limit Orders
  - Market Orders
  - Immediate-or-Cancel (IOC) semantics for unfilled quantities

- **Matching Algorithms**
  - Price-Time Priority (default)
  - Pro-Rata (proportional allocation)
  - Configurable algorithm selection during engine initialization

- **Matching Logic**
  - Bid/Ask sorting:
    - **Price-Time**:
      - Bids: Descending price → Ascending time
      - Asks: Ascending price → Ascending time
    - **Pro-Rata**:
      - Bids: Descending price → Descending quantity → Ascending time
      - Asks: Ascending price → Descending quantity → Ascending time
  - Partial order fills supported
  - Market orders never enter order book

## Example Usage

```typescript
import { MatchingEngine, MatchingAlgorithm, OrderSide, OrderType } from './MatchingEngine'

// Create engines with different algorithms
const priceTimeEngine = new MatchingEngine() // default
const proRataEngine = new MatchingEngine(MatchingAlgorithm.PRO_RATA)

// Pro-Rata matching example
const engine = new MatchingEngine(MatchingAlgorithm.PRO_RATA)

// Add larger quantity order (later time)
engine.match({
  id: '1',
  price: 100,
  side: OrderSide.BID,
  quantity: 10,
  time: Date.now() + 1,
  type: OrderType.LIMIT
})

// Add smaller quantity order (earlier time)
engine.match({
  id: '2',
  price: 100,
  side: OrderSide.BID,
  quantity: 5,
  time: Date.now(),
  type: OrderType.LIMIT
})

// Matching ask order
const trades = engine.match({
  id: '3',
  price: 100,
  side: OrderSide.ASK,
  quantity: 8,
  time: Date.now(),
  type: OrderType.LIMIT
})

// Execution order: Larger quantity (10) first, then smaller (5)
// Trades: [{bidOrderId: '1', quantity: 8}, ...]
```

## Execution Priorities

### Price-Time (Default)
1. Price priority
2. Time priority (earlier orders first)

### Pro-Rata
1. Price priority
2. Quantity priority (larger orders first)
3. Time priority (earlier orders first)

## Current Limitations
- Single instrument support only
- No hybrid matching algorithms
- No minimum volume thresholds for pro-rata
- No order execution visualization
- No advanced order types (stop orders, etc.)
- No performance optimizations for large order books

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

