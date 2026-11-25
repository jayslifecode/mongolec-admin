import { gql } from '@apollo/client'

export const CREATE_NEWS_ARTICLE = gql`
  mutation CreateNewsArticle($input: CreateNewsArticleInput!) {
    createNewsArticle(input: $input) {
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

export const UPDATE_NEWS_ARTICLE = gql`
  mutation UpdateNewsArticle($id: ID!, $input: UpdateNewsArticleInput!) {
    updateNewsArticle(id: $id, input: $input) {
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

export const DELETE_NEWS_ARTICLE = gql`
  mutation DeleteNewsArticle($id: ID!) {
    deleteNewsArticle(id: $id)
  }
`

export const CREATE_NEWS_CATEGORY = gql`
  mutation CreateNewsCategory($input: CreateNewsCategoryInput!) {
    createNewsCategory(input: $input) {
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

export const UPDATE_NEWS_CATEGORY = gql`
  mutation UpdateNewsCategory($id: ID!, $input: UpdateNewsCategoryInput!) {
    updateNewsCategory(id: $id, input: $input) {
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

export const DELETE_NEWS_CATEGORY = gql`
  mutation DeleteNewsCategory($id: ID!) {
    deleteNewsCategory(id: $id)
  }
`
