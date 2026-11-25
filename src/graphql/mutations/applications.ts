import { gql } from '@apollo/client'

export const APPROVE_APPLICATION = gql`
  mutation ApproveApplication($id: ID!, $notes: String) {
    approveApplication(id: $id, notes: $notes) {
      id
      status
      reviewNotes
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const REJECT_APPLICATION = gql`
  mutation RejectApplication($id: ID!, $reason: String!) {
    rejectApplication(id: $id, reason: $reason) {
      id
      status
      reviewNotes
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const WAITLIST_APPLICATION = gql`
  mutation WaitlistApplication($id: ID!, $notes: String) {
    waitlistApplication(id: $id, notes: $notes) {
      id
      status
      reviewNotes
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const CONFIRM_APPLICATION = gql`
  mutation ConfirmApplication($id: ID!) {
    confirmApplication(id: $id) {
      id
      status
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const CANCEL_APPLICATION = gql`
  mutation CancelApplication($id: ID!, $reason: String) {
    cancelApplication(id: $id, reason: $reason) {
      id
      status
      reviewNotes
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const CHANGE_APPLICATION_STATUS = gql`
  mutation ChangeApplicationStatus($id: ID!, $status: ApplicationStatus!, $notes: JSON) {
    changeApplicationStatus(id: $id, status: $status, notes: $notes) {
      id
      status
      reviewNotes
      reviewedBy
      reviewedAt
      updatedAt
    }
  }
`

export const CHANGE_APPLICATION_PAYMENT_STATUS = gql`
  mutation ChangeApplicationPaymentStatus($id: ID!, $depositPaid: Boolean, $fullyPaid: Boolean) {
    changeApplicationPaymentStatus(id: $id, depositPaid: $depositPaid, fullyPaid: $fullyPaid) {
      id
      depositPaid
      fullyPaid
      updatedAt
    }
  }
`

/** Makes sure an approved application has its private acceptance-letter link; returns the URL. */
export const ENSURE_ACCEPTANCE_LINK = gql`
  mutation EnsureAcceptanceLink($applicationId: ID!) {
    ensureAcceptanceLink(applicationId: $applicationId)
  }
`
