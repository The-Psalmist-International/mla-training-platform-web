import type {
  AssessmentReviewQueueQuery,
  MyAssessmentAttemptsQuery,
} from "../../src/generated/graphql"

export {
  AssessmentReviewQueueDocument as ASSESSMENT_REVIEW_QUEUE_QUERY,
  MyAssessmentAttemptsDocument as MY_ASSESSMENT_ATTEMPTS_QUERY,
} from "../../src/generated/graphql"
export type {
  AssessmentAttemptStatus,
  AssessmentReviewQueueQuery as AssessmentReviewQueueQueryResult,
  AssessmentReviewQueueQueryVariables,
  MyAssessmentAttemptsQuery as MyAssessmentAttemptsQueryResult,
  MyAssessmentAttemptsQueryVariables,
} from "../../src/generated/graphql"
export type AssessmentReviewListItem =
  AssessmentReviewQueueQuery["assessmentReviewQueue"][number]
export type AssessmentAttemptListItem =
  MyAssessmentAttemptsQuery["myAssessmentAttempts"][number]
