import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('orders')
  createOrder(
    @Body()
    body: {
      amount: { value: string; currency_code: string };
      description?: string;
      items?: Array<{
        name: string;
        quantity: string;
        unit_amount: { value: string; currency_code: string };
      }>;
    },
  ) {
    return this.paymentsService.createOrder(body);
  }

  @Post('orders/:id/capture')
  captureOrder(@Param('id') id: string) {
    return this.paymentsService.captureOrder(id);
  }
}
