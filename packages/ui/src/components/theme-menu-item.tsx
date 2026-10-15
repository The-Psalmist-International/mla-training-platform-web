import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon"
import { DropdownMenuCheckboxItem } from "./dropdown-menu"
import { useTheme } from "./theme-provider"

export function ThemeMenuItem() {
  const { theme, toggleTheme } = useTheme()
  return <DropdownMenuCheckboxItem checked={theme === "dark"} onCheckedChange={toggleTheme} closeOnClick={false} indicator="switch">
    <MoonIcon aria-hidden />Dark mode
  </DropdownMenuCheckboxItem>
}
