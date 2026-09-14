import { Injectable } from '@nestjs/common';
import {
  ActiveOrderService,
  RequestContext,
} from '@vendure/core';
import Razorpay from 'razorpay';

@Injectable()
export class RazorpayService {
  private readonly razorpay: Razorpay;

  constructor(
    private activeOrderService: ActiveOrderService,
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

    return {
      id: razorpayOrder.id,
      amount: Number(razorpayOrder.amount),
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID!,
    };
  }
}