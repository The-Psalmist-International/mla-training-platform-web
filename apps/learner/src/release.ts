import app from "../package.json"
import releases from "./releases.json"
import type {
  ReleaseNotesConfig,
  ReleaseNote,
} from "@workspace/ui/lib/release-notes"

export const learnerRelease: ReleaseNotesConfig = {
  appId: "learner",
  appName: "MLA Learners",
  version: app.version,
  releases: releases as ReleaseNote[],
}
