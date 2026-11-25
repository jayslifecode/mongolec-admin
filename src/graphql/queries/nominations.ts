import { gql } from '@apollo/client'
import { PAGINATION_FIELDS } from '../fragments/pagination'

export const GET_NOMINATIONS = gql`
  ${PAGINATION_FIELDS}
  query GetNominations(
    $status: NominationStatus
    $country: String
    $limit: Int
    $page: Int
  ) {
    getNominations(
      status: $status
      country: $country
      limit: $limit
      page: $page
    ) {
      nominations {
        id
        country
        parkNames
        parkWebsites
        parkContactFirstName
        parkContactLastName
        parkContactEmail
        partnerOrganizationName
        partnerContactFirstName
        partnerContactLastName
        partnerContactEmail
        partnerWebsite
        partnerAddress
        primaryMission
        motorcycleSupport
        partnerLogisticsSupport
        otherInfo
        status
        reviewedBy
        reviewedAt
        createdAt
        updatedAt
      }
      pagination {
        ...PaginationFields
      }
    }
  }
`

export const GET_NOMINATION = gql`
  query GetNomination($id: ID!) {
    getNomination(id: $id) {
      id
      country
      parkNames
      parkWebsites
      parkContactFirstName
      parkContactLastName
      parkContactEmail
      partnerOrganizationName
      partnerContactFirstName
      partnerContactLastName
      partnerContactEmail
      partnerWebsite
      partnerAddress
      primaryMission
      motorcycleSupport
      partnerLogisticsSupport
      otherInfo
      howHeard
      status
      reviewedBy
      reviewedAt
      reviewNotes
      createdAt
      updatedAt
    }
  }
`

export const GET_NOMINATION_STATS = gql`
  query GetNominationStats {
    getNominationStats {
      total
      pending
      underReview
      approved
      rejected
      selected
      notSelected
    }
  }
`
