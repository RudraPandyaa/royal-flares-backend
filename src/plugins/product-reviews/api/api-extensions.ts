import gql from 'graphql-tag';

export const productReviewsShopApiExtensions = gql`
    enum ReviewStatus {
        PENDING
        APPROVED
        REJECTED
    }

    type ProductReview {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        rating: Int!
        title: String
        body: String!
        customerName: String!
        verifiedPurchase: Boolean!
        status: ReviewStatus!
        images: [Asset!]!
        product: Product!
    }

    type ProductReviewList {
        items: [ProductReview!]!
        totalItems: Int!
        averageRating: Float!
    }

    input SubmitProductReviewInput {
        productId: ID!
        rating: Int!
        title: String
        body: String!
        customerName: String!
        assetIds: [ID!]
    }

    extend type Query {
        productReviews(productId: ID!): ProductReviewList!
    }

    extend type Mutation {
        submitProductReview(
            input: SubmitProductReviewInput!
        ): ProductReview!
    }
`;

export const productReviewsAdminApiExtensions = gql`
    enum ReviewStatus {
        PENDING
        APPROVED
        REJECTED
    }

    type ProductReview {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        rating: Int!
        title: String
        body: String!
        customerName: String!
        verifiedPurchase: Boolean!
        status: ReviewStatus!
        images: [Asset!]!
        product: Product!
    }

    extend type Query {
        adminProductReviews(
            status: ReviewStatus
        ): [ProductReview!]!
    }

    extend type Mutation {
        updateProductReviewStatus(
            id: ID!
            status: ReviewStatus!
        ): ProductReview!
    }
`;