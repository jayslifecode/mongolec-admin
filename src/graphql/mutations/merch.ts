import { gql } from '@apollo/client'

export const CREATE_MERCH_PRODUCT = gql`
  mutation CreateMerchProduct($input: CreateMerchProductInput!) {
    createMerchProduct(input: $input) {
      id
      sku
      name
      description
      shortDescription
      price
      compareAtPrice
      costPrice
      currency
      inventory
      trackInventory
      allowBackorder
      minStock
      maxStock
      weight
      dimensions
      featuredImage
      images
      tags
      hasVariants
      options
      variants {
        id
        sku
        barcode
        title
        optionValues
        price
        compareAtPrice
        costPrice
        inventory
        weight
        dimensions
        image
        position
        isAvailable
        createdAt
        updatedAt
      }
      metaTitle
      metaDescription
      searchKeywords
      status
      isFeatured
      isDigital
      publishedAt
      category {
        id
        name
        slug
        description
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_MERCH_PRODUCT = gql`
  mutation UpdateMerchProduct($id: ID!, $input: UpdateMerchProductInput!) {
    updateMerchProduct(id: $id, input: $input) {
      id
      sku
      name
      description
      shortDescription
      price
      compareAtPrice
      costPrice
      currency
      inventory
      trackInventory
      allowBackorder
      minStock
      maxStock
      weight
      dimensions
      featuredImage
      images
      tags
      hasVariants
      options
      variants {
        id
        sku
        barcode
        title
        optionValues
        price
        compareAtPrice
        costPrice
        inventory
        weight
        dimensions
        image
        position
        isAvailable
        createdAt
        updatedAt
      }
      metaTitle
      metaDescription
      searchKeywords
      status
      isFeatured
      isDigital
      publishedAt
      category {
        id
        name
        slug
        description
      }
      createdAt
      updatedAt
    }
  }
`

export const CREATE_MERCH_CATEGORY = gql`
  mutation CreateMerchCategory($input: CreateMerchCategoryInput!) {
    createMerchCategory(input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_MERCH_CATEGORY = gql`
  mutation UpdateMerchCategory($id: ID!, $input: UpdateMerchCategoryInput!) {
    updateMerchCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      createdAt
      updatedAt
    }
  }
`

export const CREATE_MERCH_DISCOUNT = gql`
  mutation CreateMerchDiscount($input: CreateMerchDiscountInput!) {
    createMerchDiscount(input: $input) {
      id
      name
      type
      value
      startDate
      endDate
      isActive
      productIds
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_MERCH_DISCOUNT = gql`
  mutation UpdateMerchDiscount($id: ID!, $input: UpdateMerchDiscountInput!) {
    updateMerchDiscount(id: $id, input: $input) {
      id
      name
      type
      value
      startDate
      endDate
      isActive
      productIds
      createdAt
      updatedAt
    }
  }
`

export const DELETE_MERCH_DISCOUNT = gql`
  mutation DeleteMerchDiscount($id: ID!) {
    deleteMerchDiscount(id: $id)
  }
`

export const CREATE_PRESIGNED_UPLOAD_URL = gql`
  mutation CreatePresignedUploadUrl($fileType: String!) {
    createPresignedUploadUrl(fileType: $fileType) {
      uploadUrl
      fileUrl
    }
  }
`
