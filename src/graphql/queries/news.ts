import { gql } from '@apollo/client'

export const GET_NEWS_ARTICLE_BY_ID = gql`
  query GetNewsArticleById($id: ID!, $language: String) {
    getNewsArticleById(id: $id, language: $language) {
      id
      slug
      title
      subtitle
      excerpt
      byline
      blocks
      featuredImage
      socialImage
      location
      source
      status
      priority
      isBreaking
      isFeatured
      metaTitle
      metaDescription
      keywords
      publishedAt
      scheduledAt
      category {
        id
        name
        slug
        description
        color
        icon
      }
      createdAt
      updatedAt
    }
  }
`

export const GET_NEWS_CATEGORIES = gql`
  query GetNewsCategories($language: String) {
    getNewsCategories(language: $language) {
      id
      name
      slug
      description
      color
      createdAt
      updatedAt
    }
  }
`

export const GET_NEWS_CATEGORY_BY_ID = gql`
  query GetNewsCategoryById($id: ID!, $language: String) {
    getNewsCategoryById(id: $id, language: $language) {
      id
      name
      slug
      description
      color
      createdAt
      updatedAt
    }
  }
`

/** The API returns one language per request; this fetches the Mongolian text so the edit form can hold both. */
export const GET_NEWS_CATEGORY_MN = gql`
  query GetNewsCategoryMn($id: ID!) {
    getNewsCategoryById(id: $id, language: "mn") {
      id
      name
      description
    }
  }
`
