import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { FormikProvider, useFormik } from "formik"
import { Tabs } from "@base-ui/react/tabs"
import { Switch } from "@base-ui/react/switch"
import { UserIcon } from "@phosphor-icons/react/dist/csr/User"
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck"
import { PaletteIcon } from "@phosphor-icons/react/dist/csr/Palette"
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple"
import { XIcon } from "@phosphor-icons/react/dist/csr/X"
import type { CurrentUser, DataClients, NotificationType } from "@workspace/data"
import { UpdateMyProfileDocument, ChangePasswordDocument, LogoutAllDocument } from "@workspace/data/apollo/auth/query"
import type { MyAccountQuery } from "@workspace/data"
import { MyNotificationEmailOptOutsDocument, SetNotificationEmailEnabledDocument } from "@workspace/data/apollo/notification/query"
import { accountOptions, accountProfileSchema, accountPasswordSchema, accountErrorMessage } from "../lib/account-settings"
import { notificationCopy } from "../lib/notifications"
import { uploadImage, validateImageFile } from "../lib/image-upload"
import { Button } from "./button"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./dialog"
import { ConfirmationDialog } from "./confirmation-dialog"
import { FormInput, FormFeedback } from "./form-input"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { useTheme } from "./theme-provider"
import { useToast } from "./toaster"

type Profile = NonNullable<MyAccountQuery["me"]>
type Section = "profile" | "security" | "appearance"
type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: CurrentUser
  dataClients: DataClients
  onProfileSaved: (profile: Profile) => void
  onSessionEnded: () => Promise<void>
}

export function AccountSettingsPopover({ open, onOpenChange, ...props }: Props) {
  const [section, setSection] = useState<Section>("profile")
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [discard, setDiscard] = useState(false)
  const [pendingSection, setPendingSection] = useState<Section | null>(null)
  const close = () => {
    if (busy) return
    if (dirty) { setPendingSection(null); setDiscard(true) }
    else onOpenChange(false)
  }
  const changeSection = (next: Section) => {
    if (next === section || busy) return
    if (dirty) { setPendingSection(next); setDiscard(true) }
    else setSection(next)
  }
  return <>
    <Dialog open={open} onOpenChange={(next) => { if (!next) close() }}>
      <DialogContent showCloseButton={false} className="h-[min(680px,calc(100dvh-2rem))] max-w-[980px] flex-col gap-0 sm:flex-row">
        <aside className="shrink-0 border-b border-border/70 p-3 sm:w-60 sm:border-r sm:border-b-0 sm:p-4">
          <p className="mb-3 px-3 pt-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Personal settings</p>
          <nav aria-label="Personal settings" className="flex gap-1 overflow-x-auto sm:flex-col">
            {([{ id: "profile", label: "Account settings", icon: UserIcon }, { id: "security", label: "Privacy & security", icon: ShieldCheckIcon }, { id: "appearance", label: "Appearance", icon: PaletteIcon }] as const).map(item => <button key={item.id} type="button" disabled={busy} aria-current={section === item.id ? "page" : undefined} onClick={() => changeSection(item.id)} className={`flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 text-left text-sm outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${section === item.id ? "bg-muted font-medium text-foreground" : "text-muted-foreground"}`}><item.icon aria-hidden className={`size-4 ${section === item.id ? "text-primary" : ""}`} />{item.label}</button>)}
          </nav>
        </aside>
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <Button variant="ghost" size="icon" className="absolute top-3 right-3 z-10 size-9" aria-label="Close account settings" onClick={close} disabled={busy}><XIcon aria-hidden /></Button>
          <AccountContent {...props} section={section} onDirty={setDirty} onBusy={setBusy} />
        </section>
      </DialogContent>
    </Dialog>
    {discard && <ConfirmationDialog title="Discard unsaved changes" variant="warning" description="You have unsaved changes. Discard them to continue?" onClose={() => setDiscard(false)} actions={<><Button variant="outline" onClick={() => setDiscard(false)}>Keep editing</Button><Button variant="destructive" onClick={() => { setDiscard(false); setDirty(false); if (pendingSection) setSection(pendingSection); else onOpenChange(false) }}>Discard changes</Button></>} />}
  </>
}

function AccountContent(props: Omit<Props, "open" | "onOpenChange"> & { section: Section; onDirty: (value: boolean) => void; onBusy: (value: boolean) => void }) {
  const query = useQuery(accountOptions(props.dataClients, props.user.id))
  if (query.isPending) return <><SettingsHeader title="Account settings" description="Manage your personal information and preferences." /><p role="status" className="p-6 text-sm text-muted-foreground">Loading account settings…</p></>
  if (query.isError) return <><SettingsHeader title="Account settings" description="Manage your personal information and preferences." /><div className="p-6"><p role="alert" className="text-sm">Your account could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>Try again</Button></div></>
  if (props.section === "security") return <SecuritySettings {...props} profile={query.data} />
  if (props.section === "appearance") return <AppearanceSettings />
  return <ProfileSettings {...props} profile={query.data} />
}

function SettingsHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-border/70 py-5 pr-14 pl-5 sm:pl-6"><div className="min-w-0"><DialogTitle className="text-base font-semibold">{title}</DialogTitle><DialogDescription className="mt-1 text-sm leading-5">{description}</DialogDescription></div>{actions && <div className="flex items-center gap-2">{actions}</div>}</header>
}

function useFormGuard(dirty: boolean, busy: boolean, onDirty: (value: boolean) => void, onBusy: (value: boolean) => void) {
  useEffect(() => { onDirty(dirty); return () => onDirty(false) }, [dirty, onDirty])
  useEffect(() => { onBusy(busy); return () => onBusy(false) }, [busy, onBusy])
}

function ProfileSettings({ profile, dataClients, onProfileSaved, user, onDirty, onBusy }: { profile: Profile; dataClients: DataClients; user: CurrentUser; onProfileSaved: Props["onProfileSaved"]; onDirty: (value: boolean) => void; onBusy: (value: boolean) => void }) {
  const cache = useQueryClient()
  const { toast } = useToast()
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<"name" | "phone" | null>(null)
  const [tab, setTab] = useState("profile")
  const [uploading, setUploading] = useState(false)
  const form = useFormik({
    initialValues: { name: profile.name, phone: profile.phone ?? "", avatarUrl: profile.avatarUrl ?? "" },
    validationSchema: accountProfileSchema,
    onSubmit: async (values, helpers) => {
      try {
        const result = await dataClients.apolloClient.mutate({ mutation: UpdateMyProfileDocument, variables: { name: values.name.trim(), phone: values.phone.trim() || null, avatarUrl: values.avatarUrl || null }, context: { toast: false } })
        if (!result.data) throw new Error("Missing profile response")
        const saved = result.data.updateMyProfile
        if (saved.id !== user.id) throw new Error("Unexpected account")
        cache.setQueryData(accountOptions(dataClients, user.id).queryKey, saved)
        onProfileSaved(saved)
        helpers.resetForm({ values: { name: saved.name, phone: saved.phone ?? "", avatarUrl: saved.avatarUrl ?? "" } })
        setEditing(null)
        toast({ title: "Account updated", status: "success" })
      } catch (error) { toast({ title: "Couldn’t update your account", description: accountErrorMessage(error), status: "error" }) }
    },
  })
  const busy = uploading || form.isSubmitting
  useFormGuard(form.dirty, busy, onDirty, onBusy)
  const upload = async (file: File) => {
    try {
      validateImageFile(file)
      setUploading(true)
      const url = await uploadImage(file)
      await form.setFieldValue("avatarUrl", url)
    } catch (error) { toast({ title: "Couldn’t upload your photo", description: error instanceof Error ? error.message : "Try again.", status: "error" }) }
    finally { setUploading(false); if (input.current) input.current.value = "" }
  }
  return <FormikProvider value={form}><form noValidate onSubmit={form.handleSubmit} className="flex min-h-0 flex-1 flex-col">
    <SettingsHeader title="Account settings" description="Manage your profile and account preferences." actions={tab === "profile" ? <><Button variant="outline" type="button" disabled={!form.dirty || busy} onClick={() => { form.resetForm(); setEditing(null) }}>Discard</Button><Button type="submit" disabled={!form.dirty || busy}>{form.isSubmitting ? "Saving…" : "Save changes"}</Button></> : undefined} />
    <Tabs.Root value={tab} onValueChange={value => { if (!busy) setTab(String(value)) }} className="flex min-h-0 flex-1 flex-col">
      <Tabs.List aria-label="Account settings" className="flex shrink-0 gap-6 border-b border-border/70 px-5 sm:px-6">{["profile", "notifications"].map(value => <Tabs.Tab key={value} value={value} disabled={busy} className="min-h-12 border-b-2 border-transparent text-sm text-muted-foreground capitalize outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-primary data-active:font-medium data-active:text-foreground">{value}</Tabs.Tab>)}</Tabs.List>
      <Tabs.Panel value="profile" className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 outline-none sm:px-6">
        <div className="pt-3"><FormFeedback /></div>
        <SettingRow title="Profile photo" description="JPEG, PNG, or WebP, up to 5 MiB."><div className="flex flex-wrap items-center gap-3"><Avatar className="size-11"><AvatarImage src={form.values.avatarUrl || undefined} alt="Your profile photo" /><AvatarFallback>{profile.name.trim().slice(0, 1).toUpperCase()}</AvatarFallback></Avatar><input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload profile photo" disabled={busy} onChange={event => { const file = event.currentTarget.files?.[0]; if (file) void upload(file) }} /><Button variant="outline" size="sm" type="button" disabled={busy} onClick={() => input.current?.click()}>{uploading ? "Uploading…" : "Change"}</Button>{form.values.avatarUrl && <Button variant="ghost" size="sm" type="button" disabled={busy} onClick={() => void form.setFieldValue("avatarUrl", "")}>Remove</Button>}</div></SettingRow>
        <SettingRow title="Full name" description="Used on your profile and future certificates.">{editing === "name" ? <div className="w-full"><label htmlFor={`${id}-name`} className="sr-only">Full name</label><FormInput id={`${id}-name`} name="name" autoComplete="name" maxLength={100} autoFocus disabled={busy} /></div> : <div className="flex w-full items-center justify-between gap-3"><span className="break-words text-sm font-medium">{form.values.name}</span><Button type="button" variant="ghost" size="icon" aria-label="Edit full name" onClick={() => setEditing("name")} disabled={busy}><PencilSimpleIcon aria-hidden /></Button></div>}</SettingRow>
        <SettingRow title="Email address" description="Your sign-in email is managed by your administrator."><span className="break-all text-sm font-medium">{profile.email}</span></SettingRow>
        <SettingRow title="Phone number" description="Optional contact number for your profile.">{editing === "phone" ? <div className="w-full"><label htmlFor={`${id}-phone`} className="sr-only">Phone number</label><FormInput id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={32} autoFocus disabled={busy} /></div> : <div className="flex w-full items-center justify-between gap-3"><span className={`text-sm ${form.values.phone ? "font-medium" : "text-muted-foreground"}`}>{form.values.phone || "Not provided"}</span><Button type="button" variant="ghost" size="icon" aria-label="Edit phone number" onClick={() => setEditing("phone")} disabled={busy}><PencilSimpleIcon aria-hidden /></Button></div>}</SettingRow>
      </Tabs.Panel>
      <Tabs.Panel value="notifications" className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 outline-none sm:px-6"><NotificationSettings dataClients={dataClients} user={user} /></Tabs.Panel>
    </Tabs.Root>
  </form></FormikProvider>
}

export function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="grid items-center gap-4 border-b border-dashed border-border/70 py-6 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><div><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><div className="flex min-w-0 items-center">{children}</div></div>
}

export function SettingWideRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-dashed border-border/70 py-6 last:border-0"><div className="min-w-0"><h3 className="text-sm font-medium">{title}</h3><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p></div><div className="flex shrink-0 items-center">{children}</div></div>
}

function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme()
  return <><SettingsHeader title="Appearance" description="Choose how the academy looks on this browser." /><div className="overflow-y-auto px-5 sm:px-6"><SettingWideRow title="Dark mode" description="Your theme preference is saved on this browser."><SettingsSwitch checked={theme === "dark"} onCheckedChange={toggleTheme} label="Dark mode" /></SettingWideRow></div></>
}

export function SettingsSwitch({ checked, onCheckedChange, disabled, label }: { checked: boolean; onCheckedChange: (value: boolean) => void; disabled?: boolean; label: string }) {
  return <Switch.Root checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-label={label} className="group relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full bg-muted ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary data-checked:ring-primary"><Switch.Thumb className="ml-0.5 size-5 rounded-full bg-background shadow-sm transition-transform duration-150 group-data-checked:translate-x-4 motion-reduce:transition-none" /></Switch.Root>
}

function SecuritySettings({ profile, dataClients, onSessionEnded, onDirty, onBusy }: { profile: Profile; dataClients: DataClients; onSessionEnded: Props["onSessionEnded"]; onDirty: (value: boolean) => void; onBusy: (value: boolean) => void }) {
  const { toast } = useToast()
  const id = useId()
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const form = useFormik({ initialValues: { currentPassword: "", password: "", confirmation: "" }, validationSchema: accountPasswordSchema,
    onSubmit: async (values, helpers) => {
      try {
        const result = await dataClients.apolloClient.mutate({ mutation: ChangePasswordDocument, variables: { input: { currentPassword: values.currentPassword, password: values.password } }, context: { toast: false } })
        if (!result.data?.changePassword) throw new Error("Missing response")
        helpers.resetForm()
        toast({ title: "Password updated", description: "Sign in again with your new password.", status: "success" })
        await onSessionEnded()
      } catch (error) { toast({ title: "Couldn’t change your password", description: accountErrorMessage(error), status: "error" }) }
    },
  })
  const busy = loggingOut || form.isSubmitting
  useFormGuard(form.dirty, busy, onDirty, onBusy)
  const logout = async () => {
    setLoggingOut(true)
    try {
      const result = await dataClients.apolloClient.mutate({ mutation: LogoutAllDocument, context: { toast: false } })
      if (!result.data?.logoutAll) throw new Error("Missing response")
      toast({ title: "Sessions signed out", status: "success" })
      await onSessionEnded()
    } catch (error) { toast({ title: "Couldn’t sign out your sessions", description: accountErrorMessage(error), status: "error" }) }
    finally { setLoggingOut(false) }
  }
  return <><SettingsHeader title="Privacy & security" description="Protect your account and manage sign-in access." /><div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 sm:px-6">
    {profile.hasPassword ? <FormikProvider value={form}><form noValidate onSubmit={form.handleSubmit} className="border-b border-dashed border-border/70 py-6"><h3 className="text-sm font-medium">Change password</h3><p className="mt-1 mb-5 text-xs leading-5 text-muted-foreground">Use at least 12 characters. Changing your password signs you out.</p><FormFeedback /><div className="max-w-sm space-y-4">{([{ name: "currentPassword", label: "Current password", autoComplete: "current-password" }, { name: "password", label: "New password", autoComplete: "new-password" }, { name: "confirmation", label: "Confirm new password", autoComplete: "new-password" }] as const).map(field => <div key={field.name} className="space-y-2"><label htmlFor={`${id}-${field.name}`} className="text-sm">{field.label}</label><FormInput id={`${id}-${field.name}`} name={field.name} type="password" autoComplete={field.autoComplete} maxLength={128} disabled={busy} /></div>)}<Button type="submit" disabled={!form.dirty || busy}>{form.isSubmitting ? "Updating…" : "Update password"}</Button></div></form></FormikProvider> : <SettingRow title="Google sign-in" description="Your password is managed by your Google account."><span className="text-sm text-muted-foreground">Connected</span></SettingRow>}
    <SettingWideRow title="Sign out all sessions" description="Revoke sign-in sessions on all devices, including this one. Existing access may remain valid for up to 15 minutes."><Button variant="outline" type="button" disabled={busy} onClick={() => setConfirmLogout(true)}>Sign out all devices</Button></SettingWideRow>
  </div>{confirmLogout && <ConfirmationDialog title="Sign out all devices" variant="warning" description="You will be signed out on this device and your refresh sessions will be revoked on all devices. Existing access may remain valid for up to 15 minutes." busy={loggingOut} onClose={() => setConfirmLogout(false)} actions={<><Button variant="outline" disabled={loggingOut} onClick={() => setConfirmLogout(false)}>Cancel</Button><Button variant="destructive" disabled={loggingOut} onClick={() => void logout()}>{loggingOut ? "Signing out…" : "Sign out all devices"}</Button></>} />}</>
}

function NotificationSettings({ dataClients, user }: { dataClients: DataClients; user: CurrentUser }) {
  const { toast } = useToast()
  const cache = useQueryClient()
  const key = ["account-email-preferences", dataClients.graphqlUrl, user.id]
  const [busy, setBusy] = useState(false)
  const query = useQuery({ queryKey: key, queryFn: async () => { const result = await dataClients.apolloClient.query({ query: MyNotificationEmailOptOutsDocument, fetchPolicy: "network-only", context: { toast: false } }); if (!result.data) throw new Error("Missing preferences"); return result.data.myNotificationEmailOptOuts } })
  const setEnabled = async (type: NotificationType, enabled: boolean) => {
    if (busy) return
    setBusy(true)
    try {
      const result = await dataClients.apolloClient.mutate({ mutation: SetNotificationEmailEnabledDocument, variables: { type, enabled }, context: { toast: false } })
      if (!result.data) throw new Error("Missing response")
      cache.setQueryData<NotificationType[]>(key, previous => enabled ? (previous ?? []).filter(item => item !== type) : [...new Set([...(previous ?? []), type])])
      toast({ title: "Email preference updated", status: "success" })
    } catch (error) { toast({ title: "Couldn’t update email preferences", description: accountErrorMessage(error), status: "error" }) }
    finally { setBusy(false) }
  }
  if (query.isPending) return <p role="status" className="py-6 text-sm text-muted-foreground">Loading notification preferences…</p>
  if (query.isError) return <div className="py-6"><p role="alert">Notification preferences could not be loaded.</p><Button variant="outline" className="mt-4" onClick={() => void query.refetch()}>Try again</Button></div>
  const types: NotificationType[] = user.role === "learner" ? ["course_assigned", "assessment_graded", "submission_reviewed", "submission_failed", "course_completed", "certificate_issued"] : ["grading_pending", "submission_pending_review", "assessment_graded", "submission_reviewed", "submission_failed", "course_completed", "certificate_issued"]
  return <><p className="pt-6 text-xs leading-5 text-muted-foreground">Choose which learning updates arrive by email. In-app notifications and security emails stay enabled. Changes save immediately.</p>{types.map(type => <SettingRow key={type} title={notificationCopy[type].title} description={notificationCopy[type].description}><SettingsSwitch checked={!query.data.includes(type)} onCheckedChange={enabled => void setEnabled(type, enabled)} disabled={busy} label={`Email: ${notificationCopy[type].title}`} /></SettingRow>)}</>
}
