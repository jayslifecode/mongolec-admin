import { gql } from '@apollo/client'
import { STORY_FIELDS } from '../fragments/story'
import { PAGINATION_FIELDS } from '../fragments/pagination'

export const GET_STORIES = gql`
  ${STORY_FIELDS}
  ${PAGINATION_FIELDS}
  query GetStories(
    $page: Int
    $limit: Int
    $type: StoryType
    $status: ContentStatus
    $featured: Boolean
    $rallyId: ID
    $search: String
    $orderBy: String
    $orderDirection: String
  ) {
    getStories(
      page: $page
      limit: $limit
      type: $type
      status: $status
      featured: $featured
      rallyId: $rallyId
      search: $search
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      stories {
        ...StoryFields
      }
      pagination {
        ...PaginationFields
      }
    }
  }
`

export const GET_STORY_BY_ID = gql`
  ${STORY_FIELDS}
  query GetStoryById($id: ID, $slug: String) {
    getStory(id: $id, slug: $slug) {
      ...StoryFields
    }
  }
`

export const GET_STORY_STATS = gql`
  query GetStoryStats($rallyId: ID) {
    getStoryStats(rallyId: $rallyId) {
      totalStories
      publishedStories
      draftStories
      featuredStories
      impactStories
      riderStories
      rallyStories
    }
  }
`
