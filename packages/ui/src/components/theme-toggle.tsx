import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon"
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun"
import { Button } from "./button"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label =
    theme === "light" ? "Switch to dark theme" : "Switch to light theme"
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 text-muted-foreground"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      {theme === "light" ? <MoonIcon aria-hidden /> : <SunIcon aria-hidden />}
    </Button>
  )
}
