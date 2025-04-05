export class OrderValidationError extends Error {
  constructor(message: string) {
    super(`Order validation failed: ${message}`)
    this.name = 'OrderValidationError'
  }
}

export class TradingDisabledError extends Error {
  constructor() {
    super('Trading is currently disabled')
    this.name = 'TradingDisabledError'
  }
}
