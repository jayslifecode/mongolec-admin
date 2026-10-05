import { gql } from '@apollo/client'
import { STORY_FIELDS } from '../fragments/story'

export const CREATE_STORY = gql`
  ${STORY_FIELDS}
  mutation CreateStory($input: StoryCreateInput!) {
    createStory(data: $input) {
      ...StoryFields
    }
  }
`

export const UPDATE_STORY = gql`
  ${STORY_FIELDS}
  mutation UpdateStory($id: ID!, $input: StoryUpdateInput!) {
    updateStory(id: $id, data: $input) {
      ...StoryFields
    }
  }
`

export const DELETE_STORY = gql`
  mutation DeleteStory($id: ID!) {
    deleteStory(id: $id) {
      success
      message
    }
  }
`

export const PUBLISH_STORY = gql`
  mutation PublishStory($id: ID!) {
    publishStory(id: $id) {
      id
      status
      publishedAt
    }
  }
`

export const UNPUBLISH_STORY = gql`
  mutation UnpublishStory($id: ID!) {
    unpublishStory(id: $id) {
      id
      status
      publishedAt
    }
  }
`

export const TOGGLE_STORY_FEATURED = gql`
  mutation ToggleStoryFeatured($id: ID!) {
    toggleStoryFeatured(id: $id) {
      id
      featured
    }
  }
`

export const UPDATE_STORY_ORDER = gql`
  mutation UpdateStoryOrder($id: ID!, $order: Int!) {
    updateStoryOrder(id: $id, order: $order) {
      id
      displayOrder
    }
  }
`
