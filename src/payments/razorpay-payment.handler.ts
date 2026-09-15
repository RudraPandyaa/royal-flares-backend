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

      const storedRazorpayOrderId = (
        order.customFields as {
          razorpayOrderId?: string | null;
        }
      )?.razorpayOrderId;
      
      if (
        !storedRazorpayOrderId ||
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

      if (storedRazorpayOrderId !== razorpay_order_id) {
        return {
          amount,
          state: 'Declined' as const,
          errorMessage: 'Razorpay order ID mismatch',
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
          `${storedRazorpayOrderId}|${razorpay_payment_id}`,
        )
        .digest('hex');

      const expected = Buffer.from(
        generatedSignature,
        'utf8',
      );

      const received = Buffer.from(
        razorpay_signature,
        'utf8',
      );

      const signatureIsValid =
        expected.length === received.length &&
        crypto.timingSafeEqual(expected, received);

      if (!signatureIsValid) {
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
          razorpayOrderId: storedRazorpayOrderId,
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

  settlePayment: async () => ({
    success: true,
  }),
});