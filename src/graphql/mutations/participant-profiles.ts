import { gql } from '@apollo/client'

const PARTICIPANT_RALLY_LINK_FIELDS = gql`
  fragment ParticipantMutationRallyLinkFields on ParticipantRallyLink {
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

export const CREATE_PARTICIPANT_PROFILE = gql`
  ${PARTICIPANT_RALLY_LINK_FIELDS}
  mutation CreateParticipantProfile($input: CreateParticipantInput!) {
    createParticipant(input: $input) {
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
        ...ParticipantMutationRallyLinkFields
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_PARTICIPANT_PROFILE = gql`
  ${PARTICIPANT_RALLY_LINK_FIELDS}
  mutation UpdateParticipantProfile($id: ID!, $input: UpdateParticipantInput!) {
    updateParticipant(id: $id, input: $input) {
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
        ...ParticipantMutationRallyLinkFields
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_PARTICIPANT_PROFILE = gql`
  mutation DeleteParticipantProfile($id: ID!) {
    deleteParticipant(id: $id)
  }
`
