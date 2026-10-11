import { IconContext } from "@phosphor-icons/react/dist/lib/context"
import type { ReactNode } from "react"
import { ThemeProvider } from "./theme-provider"

const iconDefaults = { size: 20, weight: "regular" as const }

export function UiProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <IconContext.Provider value={iconDefaults}>
        {children}
      </IconContext.Provider>
    </ThemeProvider>
  )
}
