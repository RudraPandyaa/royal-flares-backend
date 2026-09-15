import { BadRequestException, Injectable } from '@nestjs/common';
import {
    Asset,
    Customer,
    ID,
    Order,
    Product,
    RequestContext,
    TransactionalConnection,
} from '@vendure/core';
import {
    In,
} from 'typeorm';
import {
    ProductReview,
    ReviewStatus,
} from '../entities/product-review.entity';

export interface SubmitProductReviewInput {
    productId: ID;
    rating: number;
    title?: string | null;
    body: string;
    customerName: string;
    assetIds?: ID[];
}

@Injectable()
export class ProductReviewService {
    constructor(
        private connection: TransactionalConnection,
    ) {}

    async getApprovedReviews(
        ctx: RequestContext,
        productId: ID,
    ) {
        const repository = this.connection.getRepository(
            ctx,
            ProductReview,
        );

        const items = await repository.find({
            where: {
                product: {
                    id: productId,
                },
                status: ReviewStatus.APPROVED,
            },
            relations: {
                product: true,
                images: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });

        const totalItems = items.length;

        const averageRating =
            totalItems === 0
                ? 0
                : items.reduce(
                      (total, review) => total + review.rating,
                      0,
                  ) / totalItems;

        return {
            items,
            totalItems,
            averageRating,
        };
    }

    async submitReview(
        ctx: RequestContext,
        input: SubmitProductReviewInput,
    ) {
        if (
            !Number.isInteger(input.rating) ||
            input.rating < 1 ||
            input.rating > 5
        ) {
            throw new BadRequestException(
                'Rating must be between 1 and 5',
            );
        }

        if (!input.body.trim()) {
            throw new BadRequestException(
                'Review body is required',
            );
        }

        const product = await this.connection
            .getRepository(ctx, Product)
            .findOne({
                where: {
                    id: input.productId,
                },
            });

        if (!product) {
            throw new BadRequestException(
                'Product not found',
            );
        }

        let customer: Customer | null = null;

        if (ctx.activeUserId) {
            customer = await this.connection
                .getRepository(ctx, Customer)
                .createQueryBuilder('customer')
                .leftJoin('customer.user', 'user')
                .where('user.id = :userId', {
                    userId: ctx.activeUserId,
                })
                .getOne();
        }

        let images: Asset[] = [];

        if (input.assetIds?.length) {
            images = await this.connection
                .getRepository(ctx, Asset)
                .find({
                    where: {
                        id: In(input.assetIds),
                    },
                });
        }

        let verifiedPurchase = false;

        if (customer) {
            const purchasedOrder = await this.connection
                .getRepository(ctx, Order)
                .createQueryBuilder('order')
                .innerJoin('order.customer', 'customer')
                .innerJoin('order.lines', 'line')
                .innerJoin('line.productVariant', 'variant')
                .innerJoin('variant.product', 'product')
                .where('customer.id = :customerId', {
                    customerId: customer.id,
                })
                .andWhere('product.id = :productId', {
                    productId: input.productId,
                })
                .andWhere('order.state = :state', {
                    state: 'PaymentSettled',
                })
                .getOne();

            verifiedPurchase = !!purchasedOrder;
        }

        const review = new ProductReview({
            product,
            customer,
            rating: input.rating,
            title: input.title?.trim() || null,
            body: input.body.trim(),
            customerName: input.customerName.trim(),
            images,
            status: ReviewStatus.PENDING,

            verifiedPurchase,
        });

        return this.connection
            .getRepository(ctx, ProductReview)
            .save(review);
    }

    async getAdminReviews(
    ctx: RequestContext,
    status?: ReviewStatus,
    ) {
        const repository = this.connection.getRepository(
            ctx,
            ProductReview,
        );

        return repository.find({
            where: status
                ? {
                    status,
                }
                : {},
            relations: {
                product: true,
                images: true,
                customer: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async updateReviewStatus(
        ctx: RequestContext,
        id: ID,
        status: ReviewStatus,
    ) {
        const repository = this.connection.getRepository(
            ctx,
            ProductReview,
        );

        const review = await repository.findOne({
            where: {
                id,
            },
            relations: {
                product: true,
                images: true,
                customer: true,
            },
        });

        if (!review) {
            throw new BadRequestException(
                'Product review not found',
            );
        }

        if (
            status !== ReviewStatus.PENDING &&
            status !== ReviewStatus.APPROVED &&
            status !== ReviewStatus.REJECTED
        ) {
            throw new BadRequestException(
                'Invalid review status',
            );
        }

        review.status = status;

        return repository.save(review);
    }
}