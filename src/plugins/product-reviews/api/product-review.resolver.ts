import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
    Ctx,
    ID,
    RequestContext,
} from '@vendure/core';
import {
    ProductReviewService,
    SubmitProductReviewInput,
} from '../services/product-review.service';

@Resolver()
export class ProductReviewShopResolver {
    constructor(
        private productReviewService: ProductReviewService,
    ) {}

    @Query()
    productReviews(
        @Ctx() ctx: RequestContext,
        @Args('productId') productId: ID,
    ) {
        return this.productReviewService.getApprovedReviews(
            ctx,
            productId,
        );
    }

    @Mutation()
    submitProductReview(
        @Ctx() ctx: RequestContext,
        @Args('input') input: SubmitProductReviewInput,
    ) {
        return this.productReviewService.submitReview(
            ctx,
            input,
        );
    }
}