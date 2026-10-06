import { gql } from '@apollo/client'

const PARTICIPANT_RALLY_LINK_FIELDS = gql`
  fragment ParticipantRallyLinkFields on ParticipantRallyLink {
    rally {
      id
      slug
      title
      startDate
    }
    year
    role
  }
`

export const GET_PARTICIPANT_PROFILES = gql`
  ${PARTICIPANT_RALLY_LINK_FIELDS}
  query GetParticipantProfiles($limit: Int, $page: Int, $isActive: Boolean) {
    getParticipants(limit: $limit, page: $page, isActive: $isActive) {
      participants {
        id
        firstName
        lastName
        photo
        country
        bio
        isActive
        displayOrder
        slug
        honoraryTitle
        rallyCount
        tier
        rallies {
          ...ParticipantRallyLinkFields
        }
        createdAt
        updatedAt
      }
      pagination {
        total
        totalPages
        currentPage
        perPage
        hasNextPage
        hasPreviousPage
      }
    }
  }
`

export const GET_PARTICIPANT_PROFILE = gql`
  ${PARTICIPANT_RALLY_LINK_FIELDS}
  query GetParticipantProfile($id: ID!) {
    getParticipant(id: $id) {
      id
      firstName
      lastName
      photo
      country
      bio
      isActive
      displayOrder
      slug
      honoraryTitle
      rallyCount
      tier
      rallies {
        ...ParticipantRallyLinkFields
      }
      createdAt
      updatedAt
    }
  }
`
