import { IsEnum, IsUUID, IsNumber, Min, ValidateIf, IsPositive } from 'class-validator'
import { OrderSide, Order, OrderType } from './types'

export class OrderDto implements Omit<Order, 'type'> {
  @IsUUID()
  id: string

  @IsEnum(OrderSide, { message: 'side must be a valid enum value' })
  side: OrderSide

  @IsNumber()
  @Min(0.00000001, { message: 'quantity must be greater than or equal to 0.00000001' })
  quantity: number

  @IsNumber()
  time: number

  @ValidateIf((o) => o.type === OrderType.LIMIT)
  @IsNumber()
  @IsPositive()
  price?: number

  @IsEnum(OrderType)
  type: OrderType
}
