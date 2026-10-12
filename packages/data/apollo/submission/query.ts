import type {
  VideoSubmissionReviewQueueQuery,
  MyVideoSubmissionsQuery,
} from "../../src/generated/graphql"

export {
  VideoSubmissionReviewQueueDocument as VIDEO_SUBMISSION_REVIEW_QUEUE_QUERY,
  MyVideoSubmissionsDocument as MY_VIDEO_SUBMISSIONS_QUERY,
} from "../../src/generated/graphql"
export type {
  VideoSubmissionStatus,
  VideoSubmissionReviewQueueQuery as VideoSubmissionReviewQueueQueryResult,
  VideoSubmissionReviewQueueQueryVariables,
  MyVideoSubmissionsQuery as MyVideoSubmissionsQueryResult,
  MyVideoSubmissionsQueryVariables,
} from "../../src/generated/graphql"
export type VideoSubmissionReviewListItem =
  VideoSubmissionReviewQueueQuery["videoSubmissionReviewQueue"][number]
export type VideoSubmissionListItem =
  MyVideoSubmissionsQuery["myVideoSubmissions"][number]
