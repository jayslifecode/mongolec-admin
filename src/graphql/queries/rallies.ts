import { gql } from '@apollo/client'
import { RALLY_FIELDS } from '../fragments/rally'
import { PAGINATION_FIELDS } from '../fragments/pagination'

export const GET_RALLIES = gql`
  ${RALLY_FIELDS}
  ${PAGINATION_FIELDS}
  query GetRallies(
    $status: RallyStatus
    $isFeatured: Boolean
    $limit: Int
    $page: Int
  ) {
    getRallies(
      status: $status
      isFeatured: $isFeatured
      limit: $limit
      page: $page
    ) {
      rallies {
        ...RallyFields
      }
      pagination {
        ...PaginationFields
      }
    }
  }
`

export const GET_RALLY_BY_ID = gql`
  ${RALLY_FIELDS}
  query GetRallyById($id: ID!) {
    getRally(id: $id) {
      ...RallyFields
      highlights
      rangerPartnerships
    }
  }
`
