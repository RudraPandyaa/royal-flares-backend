import {
  LanguageCode,
  PaymentMethodHandler,
} from '@vendure/core';

import crypto from 'crypto';

export const razorpayPaymentHandler = new PaymentMethodHandler({
  code: 'razorpay-payment',

  description: [
    {
      languageCode: LanguageCode.en,
      value: 'Razorpay Payment',
    },
  ],

  args: {},

  createPayment: async (
    _ctx,
    order,
    amount,
    _args,
    metadata,
  ) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = metadata;

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return {
          amount,
          state: 'Declined' as const,
          errorMessage: 'Missing Razorpay payment details',
          metadata,
        };
      }

      const secret = process.env.RAZORPAY_KEY_SECRET;

      if (!secret) {
        throw new Error('RAZORPAY_KEY_SECRET is not configured');
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`,
        )
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return {
          amount,
          state: 'Declined' as const,
          errorMessage: 'Invalid Razorpay signature',
          metadata,
        };
      }

      return {
        amount,
        state: 'Settled' as const,
        transactionId: razorpay_payment_id,
        metadata: {
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      };
    } catch (error) {
      return {
        amount,
        state: 'Error' as const,
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Razorpay payment failed',
        metadata,
      };
    }
  },

  settlePayment: async () => {
    return {
      success: true,
    };
  },
});