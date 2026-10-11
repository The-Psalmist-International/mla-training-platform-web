import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type Theme = "light" | "dark"
const themeKey = "martyrs.theme"
const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
} | null>(null)

// Run before first paint. No preference means light, even on a dark-mode OS.
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${themeKey}')==='dark'?'dark':'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){document.documentElement.style.colorScheme='light'}})()`

function applyTheme(theme: Theme) {
  const style = document.createElement("style")
  style.textContent = "*,*::before,*::after{transition:none !important}"
  document.head.append(style)
  document.documentElement.classList.toggle("dark", theme === "dark")
  document.documentElement.style.colorScheme = theme
  void document.body.offsetHeight
  requestAnimationFrame(() => style.remove())
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  useEffect(() => {
    setTheme(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    )
    const sync = (event: StorageEvent) => {
      if (event.key !== themeKey && event.key !== null) return
      const next = event.newValue === "dark" ? "dark" : "light"
      applyTheme(next)
      setTheme(next)
    }
    window.addEventListener("storage", sync)
    return () => window.removeEventListener("storage", sync)
  }, [])
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light"
    applyTheme(next)
    setTheme(next)
    try {
      localStorage.setItem(themeKey, next)
    } catch {
      /* Private browsing: retain the current theme in memory. */
    }
  }
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme requires ThemeProvider")
  return context
}
