import { Mutation, Resolver } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
} from '@vendure/core';

import { RazorpayService } from '../services/razorpay.service';

@Resolver()
export class RazorpayShopResolver {
  constructor(
    private razorpayService: RazorpayService,
  ) {}

  @Mutation()
  createRazorpayOrder(
    @Ctx() ctx: RequestContext,
  ) {
    return this.razorpayService.createOrder(ctx);
  }
}