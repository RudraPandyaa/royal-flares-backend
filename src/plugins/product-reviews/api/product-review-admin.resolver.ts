import {
    Args,
    Mutation,
    Query,
    Resolver,
} from '@nestjs/graphql';
import {
    Allow,
    Ctx,
    Permission,
    RequestContext,
} from '@vendure/core';
import { ProductReviewService } from '../services/product-review.service';
import { ReviewStatus } from '../entities/product-review.entity';

@Resolver()
export class ProductReviewAdminResolver {
    constructor(
        private productReviewService: ProductReviewService,
    ) {}

    @Query()
    @Allow(Permission.Authenticated)
    adminProductReviews(
        @Ctx() ctx: RequestContext,
        @Args('status') status?: ReviewStatus,
    ) {
        return this.productReviewService.getAdminReviews(
            ctx,
            status,
        );
    }

    @Mutation()
    @Allow(Permission.Authenticated)
    updateProductReviewStatus(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string,
        @Args('status') status: ReviewStatus,
    ) {
        return this.productReviewService.updateReviewStatus(
            ctx,
            id,
            status,
        );
    }
}