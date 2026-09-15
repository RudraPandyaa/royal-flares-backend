import { Injectable } from '@nestjs/common';
import {
  ActiveOrderService,
  EntityHydrator,
  RequestContext,
  TransactionalConnection,
} from '@vendure/core';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private readonly razorpay: Razorpay;

  constructor(
    private activeOrderService: ActiveOrderService,
    private connection: TransactionalConnection,
    private entityHydrator: EntityHydrator,
  ) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured');
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(ctx: RequestContext) {
    const order = await this.activeOrderService.getActiveOrder(
      ctx,
      undefined,
    );

    if (!order) {
      throw new Error('No active Vendure order found');
    }

    await this.entityHydrator.hydrate(ctx, order, {
    relations: [
      'lines',
      'lines.taxCategory',
      // 'lines.adjustments',
      'surcharges',
      'shippingLines',
      'shippingLines.shippingMethod',
    ],
  });

    if (order.totalWithTax <= 0) {
      throw new Error('Order total must be greater than zero');
    }

    const razorpayOrder = await this.razorpay.orders.create({
      amount: order.totalWithTax,
      currency: order.currencyCode,
      receipt: order.code.slice(0, 40),
      notes: {
        vendureOrderCode: order.code,
      },
    });

    order.customFields = {
      ...order.customFields,
      razorpayOrderId: razorpayOrder.id,
    };

    await this.connection
      .getRepository(ctx, 'Order')
      .save(order);

    return {
      id: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }
}