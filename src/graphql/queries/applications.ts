import { gql } from '@apollo/client'
import { PAGINATION_FIELDS } from '../fragments/pagination'

export const GET_APPLICATIONS = gql`
  ${PAGINATION_FIELDS}
  query GetApplications(
    $status: ApplicationStatus
    $rallyId: ID
    $limit: Int
    $page: Int
  ) {
    getApplications(
      status: $status
      rallyId: $rallyId
      limit: $limit
      page: $page
    ) {
      applications {
        id
        rally {
          id
          title
          slug
          startDate
          endDate
        }
        status
        isRider
        hasMotorcycleLicense
        ridingExperience
        firstName
        lastName
        email
        phone
        country
        city
        address
        birthdate
        isMedicalProfessional
        medicalConditions
        dietaryRestrictions
        emergencyContactFirstName
        emergencyContactLastName
        emergencyContactPhone
        emergencyContactEmail
        emergencyContactRelationship
        motivation
        travelExperience
        futureLocations
        depositPaid
        depositAmount
        fullyPaid
        totalAmount
        reviewedBy
        reviewedAt
        createdAt
        updatedAt
        acceptance {
          id
          submittedAt
        }
      }
      pagination {
        ...PaginationFields
      }
    }
  }
`

export const GET_APPLICATION = gql`
  query GetApplication($id: ID!) {
    getApplication(id: $id) {
      id
      rally {
        id
        title
        slug
        startDate
        endDate
        location
        maxParticipants
        currentParticipants
      }
      status
      isRider
      hasMotorcycleLicense
      ridingExperience
      ridingVideoUrl
      firstName
      lastName
      email
      phone
      country
      city
      address
      birthdate
      hasValidPassport
      isMedicalProfessional
      medicalCertificationType
      medicalConditions
      dietaryRestrictions
      emergencyContactFirstName
      emergencyContactLastName
      emergencyContactPhone
      emergencyContactEmail
      emergencyContactRelationship
      socialMediaLinks
      motivation
      travelExperience
      futureLocations
      howHeard
      depositPaid
      depositAmount
      fullyPaid
      totalAmount
      reviewedBy
      reviewedAt
      createdAt
      updatedAt
      acceptanceUrl
      acceptance {
        id
        firstName
        lastName
        email
        agreedToCommitment
        agreedToLiability
        usePastPhotoAndBio
        photoUrl
        bio
        shippingAddress
        tshirtSize
        dietaryRestrictions
        roomingPreference
        roommatePreference
        questions
        hasPassport
        passportFileName
        submittedAt
      }
    }
  }
`

/** Admin-only download of the passport copy attached to an acceptance letter. */
export const GET_ACCEPTANCE_PASSPORT = gql`
  query GetAcceptancePassport($applicationId: ID!) {
    getAcceptancePassport(applicationId: $applicationId) {
      fileName
      mimeType
      base64
    }
  }
`

export const GET_APPLICATION_STATS = gql`
  query GetApplicationStats {
    getApplicationStats {
      totalApplications
      pendingApplications
      approvedApplications
      rejectedApplications
      waitlistedApplications
      confirmedApplications
      riderCount
      supporterCount
      totalRaising
    }
  }
`
