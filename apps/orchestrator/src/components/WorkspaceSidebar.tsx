import { useState } from "react"
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion"
import {
  Link,
  useNavigate,
  useRouter,
  useRouterState,
} from "@tanstack/react-router"
import type { CurrentUser } from "@workspace/data"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@workspace/ui/components/sidebar"
import { useTheme } from "@workspace/ui/components/theme-provider"
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon"
import { ChalkboardTeacherIcon } from "@phosphor-icons/react/dist/csr/ChalkboardTeacher"
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus"
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus"
import { CaretUpDownIcon } from "@phosphor-icons/react/dist/csr/CaretUpDown"
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut"
import {
  canAccessView,
  navigationGroups,
  workspaceViews,
  type WorkspaceView,
} from "../workspace/navigation"
import { authErrorMessage } from "../auth/session"
import { workspaceIcons } from "../workspace/icons"

const UserCircleIcon = workspaceIcons.account

function NavigationGroup({
  title,
  items,
  user,
}: {
  title: string
  items: readonly WorkspaceView[]
  user: CurrentUser
}) {
  const [open, setOpen] = useState(true)
  const reduceMotion = useReducedMotion()
  const { state, isMobile, setOpenMobile } = useSidebar()
  const path = useRouterState({
    select: (routerState) => routerState.location.pathname,
  })
  const visible = items.filter((view) => canAccessView(user.role, view))
  const iconRail = !isMobile && state === "collapsed"
  const expanded = iconRail || open
  const Indicator = expanded ? MinusIcon : PlusIcon
  if (!visible.length) return null
  return (
    <Collapsible open={expanded} onOpenChange={setOpen}>
      <SidebarGroup>
        <SidebarGroupLabel
          render={<CollapsibleTrigger />}
          tabIndex={iconRail ? -1 : 0}
          aria-hidden={iconRail || undefined}
          className="h-9 cursor-pointer justify-between text-xs font-medium tracking-wider text-muted-foreground uppercase hover:text-foreground focus-visible:ring-2 motion-reduce:transition-none"
        >
          {title}
          <motion.span
            aria-hidden
            className="flex size-3.5 shrink-0 items-center justify-center"
            initial={false}
            animate={{ rotate: expanded ? 0 : -90 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <Indicator className="size-3.5" />
          </motion.span>
        </SidebarGroupLabel>
        <CollapsibleContent
          keepMounted
          render={(panelProps) => (
            <motion.div
              {...(panelProps as HTMLMotionProps<"div">)}
              // Keep the panel visible for Motion's exit; inert removes closed links from keyboard navigation.
              hidden={false}
              inert={!expanded}
              className="overflow-hidden"
              initial={false}
              animate={{
                height: expanded ? "auto" : 0,
                opacity: expanded ? 1 : 0,
              }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          )}
        >
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visible.map((view) => {
                const item = workspaceViews[view]
                const Icon = workspaceIcons[view]
                const active = path.replace(/\/$/, "") === item.path
                return (
                  <SidebarMenuItem key={view}>
                    <motion.div
                      whileHover={
                        reduceMotion || iconRail ? undefined : { x: 2 }
                      }
                      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SidebarMenuButton
                        render={
                          <Link
                            to={item.path}
                            activeOptions={{ exact: true }}
                          />
                        }
                        tooltip={item.title}
                        isActive={active}
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          if (isMobile) setOpenMobile(false)
                        }}
                        className="h-9 px-3 text-sm font-medium transition-colors duration-150 group-data-[collapsible=icon]:px-2 motion-reduce:transition-none max-md:h-11 data-active:bg-sidebar-accent data-active:font-semibold data-active:text-sidebar-primary"
                      >
                        <Icon
                          aria-hidden
                          className="size-4 text-muted-foreground [[data-active]_&]:text-sidebar-primary"
                        />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </motion.div>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

export function WorkspaceSidebar({ user }: { user: CurrentUser }) {
  const { theme, toggleTheme } = useTheme()
  const { auth } = useRouter().options.context
  const navigate = useNavigate()
  const { isMobile, setOpenMobile } = useSidebar()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "M"
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-0"
      aria-label="Orchestrator navigation"
    >
      <SidebarHeader className="h-16 shrink-0 justify-center border-b border-sidebar-border/70 px-4 group-data-[collapsible=icon]:px-2">
        <Link
          to="/workspace"
          className="flex items-center gap-3 rounded-md outline-offset-4"
          onClick={() => setOpenMobile(false)}
          aria-label="Martyrs Orchestrator overview"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ChalkboardTeacherIcon aria-hidden size={20} weight="fill" />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block text-sm font-semibold">
              MLA Platform Console
            </span>
            <span className="block text-xs text-muted-foreground uppercase">
              Orchestrator
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 group-data-[collapsible=icon]:px-0">
        <nav aria-label="Main navigation">
          {navigationGroups.map((group) => (
            <NavigationGroup key={group.title} {...group} user={user} />
          ))}
        </nav>
      </SidebarContent>
      <SidebarFooter className="shrink-0 border-t border-sidebar-border/70 p-3 group-data-[collapsible=icon]:p-2">
        {error && (
          <p role="alert" className="px-2 text-xs leading-5 text-destructive">
            {error}
          </p>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" tooltip="Account menu" />}
                aria-label={`Account menu for ${user.name}`}
                className="h-14 gap-3 rounded-lg px-2 hover:bg-sidebar-accent"
              >
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-sm font-medium">
                    {user.name}
                  </span>
                  <span className="block text-xs text-muted-foreground capitalize">
                    {user.role}
                  </span>
                </span>
                <CaretUpDownIcon
                  aria-hidden
                  className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "top" : "right"}
                align="end"
                sideOffset={8}
                className="min-w-60"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <span className="block truncate">{user.name}</span>
                    <span className="block truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  render={<Link to="/workspace/account" />}
                  onClick={() => setOpenMobile(false)}
                >
                  <UserCircleIcon aria-hidden />
                  My account
                </DropdownMenuItem>
                <DropdownMenuCheckboxItem
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  closeOnClick={false}
                  indicator="switch"
                >
                  <MoonIcon aria-hidden />
                  Dark mode
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={pending}
                  onClick={async () => {
                    if (pending) return
                    setPending(true)
                    setError(null)
                    try {
                      await auth.signOut()
                      await navigate({ to: "/sign-in", replace: true })
                    } catch (failure) {
                      setError(authErrorMessage(failure))
                    } finally {
                      setPending(false)
                    }
                  }}
                >
                  <SignOutIcon aria-hidden />
                  {pending ? "Signing out…" : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
