import gql from 'graphql-tag';

export const razorpayShopApiExtensions = gql`
  type RazorpayOrder {
    id: String!
    amount: Int!
    currency: String!
    keyId: String!
  }

  extend type Mutation {
    createRazorpayOrder: RazorpayOrder!
  }
`;