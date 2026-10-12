import type {
  MyVideoAssetsQuery,
  MyVideoAssetsQueryVariables,
} from "../../src/generated/graphql"

export { MyVideoAssetsDocument as MY_VIDEO_ASSETS_QUERY } from "../../src/generated/graphql"
export { MyVideoAssetsPageDocument as MY_VIDEO_ASSETS_PAGE_QUERY } from "../../src/generated/graphql"
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
