import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { CurrentUser } from "@workspace/data"
import { DELETE_LESSON_VIDEO_ASSET_MUTATION } from "@workspace/data"
import { Button } from "@workspace/ui/components/button"
import { ConfirmationDialog } from "@workspace/ui/components/confirmation-dialog"
import { videoDetailsOptions, libraryActionError } from "../../workspace/library/library-actions"

export function VideoDeleteDialog({ id, user, onClose, onChanged }: {
  id: string
  user: CurrentUser
  onClose: () => void
  onChanged: (message: string) => void
}) {
  const { dataClients } = useRouter().options.context
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const query = useQuery(videoDetailsOptions(dataClients, user, id))
  const asset = query.data
  async function remove() {
    if (!asset || busy) return
    setBusy(true); setError("")
    try {
      const result = await dataClients.apolloClient.mutate({ mutation: DELETE_LESSON_VIDEO_ASSET_MUTATION, variables: { id }, context: { toast: false } })
      if (!result.data?.deleteLessonVideoAsset) throw new Error("Missing deletion response")
      onChanged(`${asset.title} deleted permanently.`); onClose()
    } catch (failure) { setError(libraryActionError(failure)) }
    finally { setBusy(false) }
  }
  return <ConfirmationDialog title="Delete video permanently" variant="warning" busy={busy || query.isPending} onClose={onClose}
    description={error || (query.isError ? "The video could not be loaded." : asset
      ? `Delete “${asset.title}” permanently? Videos attached to lessons or learner history cannot be deleted.`
      : "Loading video details…")}
    actions={<><Button variant="outline" disabled={busy} onClick={onClose}>Cancel</Button>
      {asset && <Button variant="destructive" disabled={busy} onClick={() => void remove()}>{busy ? "Deleting..." : "Delete permanently"}</Button>}</>} />
}
