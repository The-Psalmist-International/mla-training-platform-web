import { describe, expect, it } from "vitest"
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
} from "./validation"

describe("auth form validation", () => {
  it("requires email and password on sign-in", async () => {
    await expect(
      signInSchema.validate(
        { email: "", password: "", remember: false },
        { abortEarly: false }
      )
    ).rejects.toMatchObject({
      errors: expect.arrayContaining([
        "Enter your email address.",
        "Enter your password.",
      ]),
    })
  })
  it("allows existing short passwords at sign-in", async () => {
    await expect(
      signInSchema.isValid({
        email: "admin@example.com",
        password: "old",
        remember: false,
      })
    ).resolves.toBe(true)
  })
  it("validates and trims email for both email forms", async () => {
    for (const schema of [signInSchema, forgotPasswordSchema]) {
      expect(
        await schema.isValid({
          email: "not-an-email",
          password: "valid",
          remember: false,
        })
      ).toBe(false)
      expect(
        await schema.isValid({
          email: " user@example.com ",
          password: "valid",
          remember: false,
        })
      ).toBe(true)
      expect(
        await schema.isValid({
          email: `${"a".repeat(250)}@example.com`,
          password: "valid",
          remember: false,
        })
      ).toBe(false)
    }
  })
  it("limits passwords to the backend maximum", async () => {
    expect(
      await signInSchema.isValid({
        email: "user@example.com",
        password: "x".repeat(129),
        remember: true,
      })
    ).toBe(false)
    expect(
      await resetPasswordSchema.isValid({
        password: "x".repeat(129),
        confirmation: "x".repeat(129),
      })
    ).toBe(false)
  })
  it("requires a new password of at least 12 characters and matching confirmation", async () => {
    expect(
      await resetPasswordSchema.isValid({
        password: "short",
        confirmation: "short",
      })
    ).toBe(false)
    expect(
      await resetPasswordSchema.isValid({
        password: "long-password",
        confirmation: "",
      })
    ).toBe(false)
    expect(
      await resetPasswordSchema.isValid({
        password: "long-password",
        confirmation: "different-password",
      })
    ).toBe(false)
    expect(
      await resetPasswordSchema.isValid({
        password: "long-password",
        confirmation: "long-password",
      })
    ).toBe(true)
  })
  it("does not trim or otherwise alter passwords", async () => {
    const password = " spaced password "
    expect(
      (await resetPasswordSchema.validate({ password, confirmation: password }))
        .password
    ).toBe(password)
  })
})
