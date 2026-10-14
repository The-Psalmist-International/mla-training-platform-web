import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@workspace/ui/lib/utils"

export function Markdown({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "space-y-2 text-sm leading-6 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_img]:max-w-full [&_img]:rounded-md [&_hr]:border-border",
        className
      )}
    >
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: (props) => (
          <a {...props} rel="noreferrer" target="_blank" className="underline" />
        ),
        pre: (props) => (
          <pre
            {...props}
            className="overflow-x-auto rounded-md bg-muted p-3 text-xs"
          />
        ),
        code: (props) => (
          <code {...props} className="rounded bg-muted px-1 py-0.5 text-xs" />
        ),
        table: (props) => (
          <span className="block overflow-x-auto">
            <table {...props} className="w-full border-collapse text-left" />
          </span>
        ),
      }}
    >
      {value}
    </ReactMarkdown>
    </div>
  )
}
