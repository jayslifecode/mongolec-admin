import { gql } from '@apollo/client'
import { NOMINATION_REVIEW_FIELDS } from '../fragments/nomination'

export const APPROVE_NOMINATION = gql`
  ${NOMINATION_REVIEW_FIELDS}
  mutation ApproveNomination($id: ID!, $notes: String) {
    approveNomination(id: $id, notes: $notes) {
      ...NominationReviewFields
    }
  }
`

export const REJECT_NOMINATION = gql`
  ${NOMINATION_REVIEW_FIELDS}
  mutation RejectNomination($id: ID!, $reason: String!) {
    rejectNomination(id: $id, reason: $reason) {
      ...NominationReviewFields
    }
  }
`

export const SELECT_NOMINATION = gql`
  mutation SelectNomination($id: ID!, $rallyId: ID!) {
    selectNomination(id: $id, rallyId: $rallyId) {
      id
      status
      selectedForRallyId
      updatedAt
    }
  }
`
