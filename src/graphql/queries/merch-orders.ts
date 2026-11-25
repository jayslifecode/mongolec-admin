import { gql } from '@apollo/client'

const ORDER_FIELDS = `
  id
  orderNumber
  userId
  customerName
  phone
  email
  address
  notes
  status
  deliveryMethod
  paymentMethod
  paymentClaimedAt
  subtotal
  total
  currency
  tenantId
  items {
    id
    productId
    name
    image
    variantId
    variantName
    unitPrice
    quantity
  }
  payments {
    id
    provider
    status
    amount
    paidAmount
    fee
    netAmount
    paymentWallet
    paymentType
    settlementStatus
    ebarimtCustomerNo
    currency
    qpayInvoiceId
    qpayPaymentId
    paidAt
    createdAt
  }
  createdAt
  updatedAt
`

export const GET_MERCH_ORDERS = gql`
  query GetMerchOrders($status: String, $tenantId: String, $limit: Int, $offset: Int) {
    getMerchOrders(status: $status, tenantId: $tenantId, limit: $limit, offset: $offset) {
      ${ORDER_FIELDS}
    }
  }
`
