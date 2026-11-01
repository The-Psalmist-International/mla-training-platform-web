import { lazy, Suspense, useEffect, useState } from "react"
import { useRouter } from "@tanstack/react-router"
import type { CertificateListItem } from "@workspace/data/apollo/certificate/query"
import { Button } from "@workspace/ui/components/button"
import { Alert } from "@workspace/ui/components/alert"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@workspace/ui/components/dialog"

const Reader = lazy(() =>
  import("@workspace/ui/components/document-reader").then((module) => ({
    default: module.DocumentReader,
  }))
)

export function CertificateActions({
  certificate,
}: {
  certificate: CertificateListItem
}) {
  const { dataClients } = useRouter().options.context
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string>()
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [shared, setShared] = useState(false)
  useEffect(() => {
    if (!open) return
    const controller = new AbortController()
    let objectUrl: string | undefined
    setBusy(true)
    setError("")
    setUrl(undefined)
    void dataClients
      .fetchCertificatePdf(certificate.id, controller.signal)
      .then((blob) => {
        if (controller.signal.aborted) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setError(
            failure instanceof Error
              ? failure.message
              : "Certificate unavailable."
          )
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false)
      })
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [open, certificate.id, dataClients])
  async function share() {
    try {
      if (navigator.share)
        await navigator.share({
          title: `${certificate.courseTitle} certificate`,
          url: certificate.verificationUrl,
        })
      else {
        await navigator.clipboard.writeText(certificate.verificationUrl)
        setShared(true)
      }
    } catch (failure) {
      if (!(failure instanceof Error && failure.name === "AbortError"))
        setError("The verification link could not be shared. Please try again.")
    }
  }
  return (
    <>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}>View certificate</Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{certificate.courseTitle} certificate</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {certificate.status === "revoked" && (
              <Alert variant="warning">
                This certificate has been revoked. {certificate.revokedReason}
              </Alert>
            )}
            {error && <Alert variant="warning">{error}</Alert>}
            {shared && (
              <p role="status" className="text-sm text-muted-foreground">
                Verification link copied.
              </p>
            )}
            {busy && <p role="status">Loading your certificate…</p>}
            {url && (
              <Suspense
                fallback={<p role="status">Preparing certificate preview…</p>}
              >
                <Reader url={url} title={certificate.courseTitle} />
              </Suspense>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              disabled={!url}
              onClick={() => {
                if (!url) return
                const link = document.createElement("a")
                link.href = url
                link.download = `${certificate.certificateNumber}.pdf`
                link.click()
              }}
            >
              Download PDF
            </Button>
            <Button
              variant="outline"
              disabled={certificate.status === "revoked"}
              onClick={() => void share()}
            >
              Share verification link
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
