import type {
  MyVideoAssetsQuery,
  MyVideoAssetsQueryVariables,
} from "../../src/generated/graphql"

export { MyVideoAssetsDocument as MY_VIDEO_ASSETS_QUERY } from "../../src/generated/graphql"
export { MyVideoAssetsPageDocument as MY_VIDEO_ASSETS_PAGE_QUERY } from "../../src/generated/graphql"
export {
  VideoAssetDetailsDocument as VIDEO_ASSET_DETAILS_QUERY,
  PreviewLessonVideoDocument as PREVIEW_LESSON_VIDEO_QUERY,
  CreateLessonVideoUploadDocument as CREATE_LESSON_VIDEO_UPLOAD_MUTATION,
  RefreshLessonVideoUploadDocument as REFRESH_LESSON_VIDEO_UPLOAD_MUTATION,
  SyncLessonVideoAssetDocument as SYNC_LESSON_VIDEO_ASSET_MUTATION,
  SetLessonVideoThumbnailDocument as SET_LESSON_VIDEO_THUMBNAIL_MUTATION,
} from "../../src/generated/graphql"
export type { CreateLessonVideoUploadMutation } from "../../src/generated/graphql"
export type {
  VideoAssetStatus,
  MyVideoAssetsQuery as MyVideoAssetsQueryResult,
  MyVideoAssetsQueryVariables,
} from "../../src/generated/graphql"
export type VideoAssetListItem = MyVideoAssetsQuery["myVideoAssets"][number]
export type PageVariables = Pick<
  MyVideoAssetsQueryVariables,
  "limit" | "offset"
>
