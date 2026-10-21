import { useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import type { CurrentUser, DataClients } from "@workspace/data"
import {
  CreateLessonDocumentUploadDocument,
  FinalizeLessonDocumentUploadDocument,
  LessonDocumentAssetDocument,
} from "@workspace/data/apollo/documents/query"
import { FileInput } from "@workspace/ui/components/file-input"
import { useToast } from "@workspace/ui/components/toaster"
import {
  courseMutation,
  courseResourceOptions,
} from "../../workspace/course/course-management"

const allowedFormats = ["pdf", "doc", "docx", "ppt", "pptx"]
const maximumFileSize = 20 * 1024 * 1024

function uploadDocument(
  endpoint: string,
  body: FormData,
  onProgress: (progress: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open("POST", endpoint)
    request.timeout = 120000
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0)
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    })
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100)
        resolve()
      } else reject(new Error(`Document upload failed with HTTP ${request.status}.`))
    })
    request.addEventListener("error", () =>
      reject(new Error("Document upload failed."))
    )
    request.addEventListener("timeout", () =>
      reject(new Error("Document upload timed out."))
    )
    request.send(body)
  })
}

export function LessonFileUpload({
  clients,
  user,
  assetId,
  onChange,
  disabled,
  onBusyChange,
}: {
  clients: DataClients
  user: CurrentUser
  assetId: string
  onChange: (id: string) => void
  disabled: boolean
  onBusyChange: (busy: boolean) => void
}) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [inputVersion, setInputVersion] = useState(0)
  const working = useRef(false)
  const notifiedFailedAsset = useRef<string | null>(null)
  const status = useQuery({
    ...courseResourceOptions(
      clients,
      user,
      "document-status",
      LessonDocumentAssetDocument,
      { id: assetId }
    ),
    enabled: !!assetId,
    refetchInterval: (query) =>
      query.state.data?.lessonFileAsset.status === "processing" ? 3000 : false,
  })
  const asset = status.data?.lessonFileAsset

  const resetSelection = () => {
    setFile(null)
    setInputVersion((value) => value + 1)
    onChange("")
  }

  const showFailure = (description: string) => {
    resetSelection()
    toast({
      title: "Lesson file could not be prepared",
      description,
      status: "error",
    })
  }

  useEffect(() => {
    if (
      asset?.status !== "failed" ||
      notifiedFailedAsset.current === asset.id
    )
      return
    notifiedFailedAsset.current = asset.id
    showFailure(
      "The file upload or preview conversion failed. Choose the file again to retry."
    )
  }, [asset?.id, asset?.status])

  const upload = async (selectedFile: File) => {
    if (working.current || disabled) return
    const format = selectedFile.name.split(".").at(-1)?.toLowerCase()
    if (
      !allowedFormats.includes(format ?? "") ||
      !selectedFile.size ||
      selectedFile.size > maximumFileSize
    ) {
      showFailure("Choose a PDF, Word, or PowerPoint file up to 20 MiB.")
      return
    }

    working.current = true
    setBusy(true)
    setUploadProgress(0)
    onBusyChange(true)
    try {
      const result = await courseMutation(
        clients,
        CreateLessonDocumentUploadDocument,
        {
          input: {
            filename: selectedFile.name,
            format: format!,
            sizeBytes: selectedFile.size,
            requestKey: crypto.randomUUID(),
          },
        }
      )
      const { upload: target, asset: reserved } =
        result.createLessonFileUpload
      const endpoint = new URL(target.endpoint)
      if (
        endpoint.origin !== "https://api.cloudinary.com" ||
        !/^\/v1_1\/[\w-]+\/raw\/upload$/.test(endpoint.pathname)
      )
        throw new Error("Invalid document upload destination.")

      const body = new FormData()
      for (const [key, value] of Object.entries({
        public_id: target.publicId,
        timestamp: target.timestamp,
        api_key: target.apiKey,
        signature: target.signature,
        type: "authenticated",
        overwrite: "false",
      }))
        body.set(key, value)
      body.set("file", selectedFile)
      await uploadDocument(target.endpoint, body, setUploadProgress)

      onChange(reserved.id)
      await courseMutation(clients, FinalizeLessonDocumentUploadDocument, {
        id: reserved.id,
      })
      await clients.queryClient.invalidateQueries({
        queryKey: ["workspace", clients.graphqlUrl, user.id],
      })
    } catch {
      showFailure(
        "The file upload or preview conversion failed. Choose the file again to retry."
      )
    } finally {
      working.current = false
      setBusy(false)
      setUploadProgress(0)
      onBusyChange(false)
    }
  }

  return (
    <div className="space-y-3">
      <FileInput
        key={inputVersion}
        name="lesson-document"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        file={file}
        progress={busy ? uploadProgress : undefined}
        disabled={disabled || busy}
        helperText="PDF, Word or PowerPoint · 20 MiB maximum. Upload starts when you select a file."
        onChange={(event) => {
          const selectedFile = event.target.files?.[0] ?? null
          setFile(selectedFile)
          if (selectedFile) void upload(selectedFile)
        }}
        onRemove={resetSelection}
      />
      {(busy || asset) && (
        <p role="status" className="text-sm text-muted-foreground">
          {busy
            ? `Uploading ${file?.name ?? "lesson file"} · ${uploadProgress}%`
            : `${asset!.filename} · ${
                asset!.status === "ready"
                  ? "Ready to read"
                  : asset!.status === "processing"
                    ? "Preparing preview…"
                    : asset!.status.replaceAll("_", " ")
              }`}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        You can save a draft while its preview is prepared. Publishing requires
        a ready preview.
      </p>
    </div>
  )
}
