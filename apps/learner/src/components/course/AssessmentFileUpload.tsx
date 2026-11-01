import { useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import type { CurrentUser } from "@workspace/data"
import {
  AssessmentDocumentAssetDocument,
  AssessmentDocumentPreviewDocument,
  CreateAssessmentDocumentUploadDocument,
  FinalizeAssessmentDocumentUploadDocument,
} from "@workspace/data/apollo/documents/query"
import { FileInput } from "@workspace/ui/components/file-input"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import { learnerCourseError, learnerMutation, learnerResource } from "../../workspace/course"

const formats = ["pdf", "doc", "docx", "ppt", "pptx"]
const maximumBytes = 20 * 1024 * 1024

function transfer(endpoint: string, body: FormData, progress: (value: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("POST", endpoint)
    request.timeout = 120000
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total) progress(Math.round((event.loaded / event.total) * 100))
    })
    request.addEventListener("load", () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error("The file could not be uploaded.")))
    request.addEventListener("error", () => reject(new Error("The file could not be uploaded.")))
    request.addEventListener("timeout", () => reject(new Error("The upload timed out.")))
    request.send(body)
  })
}

export function AssessmentFileUpload({ attemptId, questionId, user, disabled, onReady }: {
  attemptId: string
  questionId: string
  user: CurrentUser
  disabled: boolean
  onReady: () => void
}) {
  const { dataClients } = useRouter().options.context
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [inputVersion, setInputVersion] = useState(0)
  const working = useRef(false)
  const query = useQuery({
    ...learnerResource(dataClients, user, "assessment-file", AssessmentDocumentAssetDocument, { attemptId, questionId }),
    refetchInterval: (state) => state.state.data?.assessmentFileAsset?.status === "processing" ? 3000 : false,
  })
  const asset = query.data?.assessmentFileAsset

  async function upload(selected: File) {
    if (working.current || disabled) return
    const format = selected.name.split(".").at(-1)?.toLowerCase()
    if (!format || !formats.includes(format) || !selected.size || selected.size > maximumBytes) {
      setError("Choose one PDF, Word, or PowerPoint file up to 20 MB.")
      setFile(null); setInputVersion((value) => value + 1); return
    }
    working.current = true; setBusy(true); setProgress(0); setError("")
    try {
      const result = await learnerMutation(dataClients, CreateAssessmentDocumentUploadDocument, {
        input: { attemptId, questionId, filename: selected.name, format, sizeBytes: selected.size, requestKey: crypto.randomUUID() },
      })
      const target = result.createAssessmentFileUpload.upload
      const endpoint = new URL(target.endpoint)
      if (endpoint.origin !== "https://api.cloudinary.com" || !/^\/v1_1\/[\w-]+\/raw\/upload$/.test(endpoint.pathname)) throw new Error("Invalid upload destination.")
      const body = new FormData()
      for (const [key, value] of Object.entries({ public_id: target.publicId, timestamp: target.timestamp, api_key: target.apiKey,
        signature: target.signature, type: "authenticated", overwrite: "false" })) body.set(key, value)
      body.set("file", selected)
      await transfer(target.endpoint, body, setProgress)
      await learnerMutation(dataClients, FinalizeAssessmentDocumentUploadDocument, { attemptId, questionId, id: result.createAssessmentFileUpload.asset.id })
      await query.refetch(); onReady()
    } catch (failure) {
      setError(learnerCourseError(failure))
      setFile(null); setInputVersion((value) => value + 1)
    } finally {
      working.current = false; setBusy(false); setProgress(0)
    }
  }

  async function openPreview() {
    try {
      const data = await dataClients.apolloClient.query({ query: AssessmentDocumentPreviewDocument, variables: { attemptId, questionId }, fetchPolicy: "network-only" })
      if (data.data?.assessmentFilePreview.url) window.open(data.data.assessmentFilePreview.url, "_blank", "noopener,noreferrer")
    } catch (failure) { setError(learnerCourseError(failure)) }
  }

  return <div className="space-y-3">
    {error && <Alert variant="warning">{error}</Alert>}
    <FileInput key={inputVersion} name={`assessment-file-${questionId}`} accept=".pdf,.doc,.docx,.ppt,.pptx" file={file}
      progress={busy ? progress : undefined} disabled={disabled || busy}
      helperText="PDF, Word or PowerPoint · 20 MB maximum. Upload starts when selected."
      onChange={(event) => { const selected = event.target.files?.[0] ?? null; setFile(selected); if (selected) void upload(selected) }} />
    {(working.current || asset) && <div className="flex flex-wrap items-center justify-between gap-3 text-sm" role="status" aria-live="polite">
      <span className="text-muted-foreground">{working.current ? `Uploading ${file?.name ?? "file"} · ${progress}%` : `${asset!.filename} · ${asset!.status === "ready" ? "Ready" : asset!.status === "processing" ? "Preparing preview…" : asset!.status.replaceAll("_", " ")}`}</span>
      {asset?.status === "ready" && <Button type="button" size="sm" variant="outline" onClick={() => void openPreview()}>Open file</Button>}
    </div>}
  </div>
}
