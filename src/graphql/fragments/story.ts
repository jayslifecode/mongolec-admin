import { gql } from '@apollo/client'

export const STORY_FIELDS = gql`
  fragment StoryFields on Story {
    id
    title
    slug
    excerpt
    content
    type
    author
    role
    featuredImage
    gallery
    videoUrl
    impactSummary
    status
    publishedAt
    featured
    displayOrder
    rally {
      id
      slug
      title
    }
    createdAt
    updatedAt
  }
`
