"use client"

import { useEffect, useRef, useState } from "react"
import type { PDFDocumentProxy, RenderTask, PDFDocumentLoadingTask } from "pdfjs-dist"
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft"
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight"
import { Button } from "./button"
import { SelectInput } from "./select"

/** One bounded canvas at a time, rather than relying on a browser PDF plug-in. */
export function DocumentReader({ url, title, onRetry }: { url: string; title: string; onRetry?: () => void }) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null)
  const [page, setPage] = useState(1), [zoom, setZoom] = useState(1), [width, setWidth] = useState(600)
  const [error, setError] = useState(false), [loading, setLoading] = useState(true), [text, setText] = useState("")
  const canvas = useRef<HTMLCanvasElement>(null), container = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(entries => setWidth(Math.max(200, entries[0]!.contentRect.width - 24)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    let active = true, task: PDFDocumentLoadingTask | undefined
    setDocument(null); setPage(1); setError(false); setLoading(true)
    void (async () => {
      const pdf = await import("pdfjs-dist")
      if (!active) return
      pdf.GlobalWorkerOptions.workerSrc = workerUrl
      task = pdf.getDocument({ url, disableRange: true, disableStream: true, disableAutoFetch: true, isEvalSupported: false })
      const loaded = await task.promise
      if (active) setDocument(loaded)
    })().catch(() => { if (active) { setError(true); setLoading(false) } })
    return () => { active = false; void task?.destroy() }
  }, [url])
  useEffect(() => {
    if (!document || !canvas.current) return
    let active = true, task: RenderTask | undefined
    setLoading(true); setText("")
    void (async () => {
      const current = await document.getPage(page)
      if (!active || !canvas.current) return
      const base = current.getViewport({ scale: 1 })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      let scale = (width / base.width) * zoom * ratio
      // Do not allocate enormous canvases for pathological document dimensions.
      scale = Math.min(scale, Math.sqrt(4_000_000 / (base.width * base.height)))
      const viewport = current.getViewport({ scale })
      canvas.current.style.width = `${viewport.width / ratio}px`
      canvas.current.style.height = `${viewport.height / ratio}px`
      task = current.render({ canvas: canvas.current, viewport })
      await task.promise
      const content = await current.getTextContent()
      if (active) { setText(content.items.flatMap(item => "str" in item ? [item.str] : []).join(" ")); setLoading(false) }
    })().catch(failure => { if (active && failure?.name !== "RenderingCancelledException") { setError(true); setLoading(false) } })
    return () => { active = false; task?.cancel() }
  }, [document, page, width, zoom])
  return <section aria-label={`${title} document reader`} className="overflow-hidden rounded-xl border border-border bg-muted/30">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-3 py-2">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Previous page" disabled={!document || page <= 1} onClick={() => setPage(value => value - 1)}><CaretLeftIcon aria-hidden /></Button>
        <span aria-live="polite" className="text-xs tabular-nums">Page {page} of {document?.numPages ?? "…"}</span>
        <Button type="button" variant="ghost" size="icon" aria-label="Next page" disabled={!document || page >= document.numPages} onClick={() => setPage(value => value + 1)}><CaretRightIcon aria-hidden /></Button>
      </div>
      <label className="flex items-center gap-2 text-xs">Zoom<SelectInput aria-label="Document zoom" value={zoom} onValueChange={setZoom} options={[{ value: 1, label: "Fit width" }, { value: 1.25, label: "125%" }, { value: 1.5, label: "150%" }]} className="h-9" /></label>
    </div>
    <div ref={container} className="relative min-h-60 overflow-auto p-3" aria-busy={loading}>
      {loading && !error && <p role="status" className="py-4 text-center text-sm text-muted-foreground">Loading document…</p>}
      {error ? <div role="alert" className="space-y-3 py-8 text-center text-sm"><p>The document could not be opened. Refresh its secure preview and try again.</p>{onRetry && <Button type="button" variant="outline" onClick={onRetry}>Retry preview</Button>}</div>
        : <><canvas ref={canvas} role="img" aria-label={`${title}, page ${page}`} className="mx-auto bg-white shadow-sm" /><p className="sr-only">{text}</p></>}
    </div>
  </section>
}
