import { createElement, type ComponentProps } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { afterEach, describe, expect, it, vi } from "vitest"
import { GoogleAuthButton } from "./GoogleAuthButton"

const controls = vi.hoisted(() => ({
  click: undefined as undefined | (() => Promise<void>),
  toast: vi.fn(),
}))
vi.mock("@workspace/ui/components/button", () => ({
  Button: ({
    variant: _variant,
    ...props
  }: ComponentProps<"button"> & { variant?: string }) => {
    controls.click = props.onClick as unknown as () => Promise<void>
    return createElement("button", props)
  },
}))
vi.mock("@workspace/ui/components/toaster", () => ({
  useToast: () => ({ toast: controls.toast }),
}))

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function render(disabled = false, pending = false) {
  const onPendingChange = vi.fn()
  const markup = renderToStaticMarkup(
    <GoogleAuthButton
      graphqlUrl="https://api.example.test/graphql"
      disabled={disabled}
      pending={pending}
      onPendingChange={onPendingChange}
    />
  )
  return { markup, onPendingChange }
}

describe("learner Google authentication button", () => {
  it("shows a neutral signup/sign-in label and accessible pending state", () => {
    expect(render().markup).toContain("Continue with Google")
    const { markup } = render(false, true)
    expect(markup).toContain("Connecting to Google")
    expect(markup).toContain('aria-busy="true"')
    expect(markup).toContain('disabled=""')
    expect(markup).toContain('type="button"')
  })

  it.each([
    [true, false],
    [false, true],
  ])(
    "does not start OAuth when disabled=%s or pending=%s",
    async (disabled, pending) => {
      const request = vi.fn()
      vi.stubGlobal("fetch", request)
      const { onPendingChange } = render(disabled, pending)
      await controls.click!()
      expect(request).not.toHaveBeenCalled()
      expect(onPendingChange).not.toHaveBeenCalled()
    }
  )

  it("uses the existing cookie-based OAuth flow and prevents duplicate starts", async () => {
    const assign = vi.fn()
    const authorizationUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?state=opaque"
    const request = vi
      .fn()
      .mockResolvedValue(Response.json({ authorizationUrl }))
    vi.stubGlobal("fetch", request)
    vi.stubGlobal("window", {
      location: { origin: "https://learn.example.test", assign },
    })
    const { onPendingChange } = render()
    controls.click!()
    controls.click!()
    await vi.waitFor(() =>
      expect(assign).toHaveBeenCalledWith(authorizationUrl)
    )
    expect(request).toHaveBeenCalledTimes(1)
    expect(String(request.mock.calls[0]![0])).toBe(
      "https://api.example.test/auth/google"
    )
    expect(request.mock.calls[0]![1]).toMatchObject({
      method: "POST",
      credentials: "include",
    })
    expect(JSON.parse(request.mock.calls[0]![1].body)).toEqual({
      returnTo: "https://learn.example.test/auth/callback",
    })
    expect(onPendingChange.mock.calls).toEqual([[true]])
  })

  it("reports failure and allows retry without requiring email form fields", async () => {
    const assign = vi.fn()
    const request = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce(
        Response.json({ authorizationUrl: "https://accounts.google.com/auth" })
      )
    vi.stubGlobal("fetch", request)
    vi.stubGlobal("window", {
      location: { origin: "https://learn.example.test", assign },
    })
    const { onPendingChange } = render()
    controls.click!()
    await vi.waitFor(() =>
      expect(onPendingChange).toHaveBeenLastCalledWith(false)
    )
    expect(controls.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        description: "Network unavailable",
      })
    )
    controls.click!()
    await vi.waitFor(() =>
      expect(assign).toHaveBeenCalledWith("https://accounts.google.com/auth")
    )
    expect(request).toHaveBeenCalledTimes(2)
  })
})
