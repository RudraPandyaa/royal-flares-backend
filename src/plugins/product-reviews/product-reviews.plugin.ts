import {
    PluginCommonModule,
    VendurePlugin,
} from '@vendure/core';

import { ProductReview } from './entities/product-review.entity';

import {
    productReviewsAdminApiExtensions,
    productReviewsShopApiExtensions,
} from './api/api-extensions';

import { ProductReviewShopResolver } from './api/product-review.resolver';
import { ProductReviewAdminResolver } from './api/product-review-admin.resolver';
import { ProductReviewService } from './services/product-review.service';

@VendurePlugin({
    imports: [PluginCommonModule],

    entities: [
        ProductReview,
    ],

    providers: [
        ProductReviewService,
    ],

    shopApiExtensions: {
        schema: productReviewsShopApiExtensions,
        resolvers: [
            ProductReviewShopResolver,
        ],
    },

    adminApiExtensions: {
        schema: productReviewsAdminApiExtensions,
        resolvers: [
            ProductReviewAdminResolver,
        ],
    },
})
export class ProductReviewsPlugin {}