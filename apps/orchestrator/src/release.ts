import app from "../package.json"
import releases from "./releases.json"
import type {
  ReleaseNotesConfig,
  ReleaseNote,
} from "@workspace/ui/lib/release-notes"

export const orchestratorRelease: ReleaseNotesConfig = {
  appId: "orchestrator",
  appName: "MLA Orchestrator",
  version: app.version,
  releases: releases as ReleaseNote[],
}
