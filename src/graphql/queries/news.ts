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
