import { IconContext } from "@phosphor-icons/react/dist/lib/context"
import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"
import { ToastProvider } from "./toaster"
import type { ToastController } from "@workspace/ui/lib/toast"

const iconDefaults = { size: 20, weight: "regular" as const }

export function UiProvider({ children, toasts }: { children: ReactNode; toasts?: ToastController }) {
  return (
    <ThemeProvider>
      <IconContext.Provider value={iconDefaults}>
        <ToastProvider controller={toasts}>{children}</ToastProvider>
      </IconContext.Provider>
    </ThemeProvider>
  )
}
