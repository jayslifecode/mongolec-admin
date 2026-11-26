import { gql } from '@apollo/client'

export const RALLY_FIELDS = gql`
  fragment RallyFields on Rally {
    id
    title
    slug
    description
    startDate
    endDate
    location
    duration
    targetAudience
    maxParticipants
    currentParticipants
    heroImage
    heroVideo
    photoCredit
    acceptanceTerms
    isFeatured
    isPlaceholder
    isRecruiting
    applicationDeadline
    status
    createdAt
    updatedAt
  }
`
