import {
  PluginCommonModule,
  VendurePlugin,
} from '@vendure/core';

import { razorpayShopApiExtensions } from './api/api-extensions';
import { RazorpayShopResolver } from './api/razorpay.resolver';
import { RazorpayService } from './services/razorpay.service';

@VendurePlugin({
  imports: [PluginCommonModule],

  shopApiExtensions: {
    schema: razorpayShopApiExtensions,
    resolvers: [RazorpayShopResolver],
  },

  providers: [RazorpayService],
})
export class RazorpayPlugin {}