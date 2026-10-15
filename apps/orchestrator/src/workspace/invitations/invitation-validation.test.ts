import { describe, expect, it } from "vitest"
import {
  invitationSchema,
  normalizeInvitationEmail,
} from "./invitation-validation"

const input = { email: "learner@example.com", role: "learner" }

// Keep each domain label realistic while exercising the total email limit.
const boundaryEmail = (length: number) =>
  `${"a".repeat(64)}@${"b".repeat(63)}.${"c".repeat(63)}.${"d".repeat(length - 197)}.com`

describe("invitation validation", () => {
  it("trims and lowercases email without changing the selected role", async () => {
    expect(normalizeInvitationEmail("  Ada+Invite@Example.COM \n")).toBe(
      "ada+invite@example.com"
    )
    await expect(
      invitationSchema.validate({
        email: "  Ada+Invite@Example.COM \n",
        role: "instructor",
      })
    ).resolves.toEqual({ email: "ada+invite@example.com", role: "instructor" })
  })

  it.each(["admin", "instructor", "learner"])(
    "accepts the %s role",
    async (role) => {
      await expect(invitationSchema.isValid({ ...input, role })).resolves.toBe(
        true
      )
    }
  )

  it.each(["owner", "Admin", "", undefined, null])(
    "rejects invalid or absent role %s",
    async (role) => {
      await expect(invitationSchema.isValid({ ...input, role })).resolves.toBe(
        false
      )
    }
  )

  it.each([
    "",
    "   ",
    "not-an-email",
    "person@localhost",
    "person@example.c",
    ".person@example.com",
    "person.@example.com",
    "per..son@example.com",
    "per son@example.com",
    "person@-example.com",
    "person@example..com",
  ])("rejects invalid email %j under the backend rules", async (email) => {
    await expect(invitationSchema.isValid({ ...input, email })).resolves.toBe(
      false
    )
  })

  it.each([253, 254])(
    "accepts a normalized email of %i characters",
    async (length) => {
      const email = boundaryEmail(length)
      expect(email).toHaveLength(length)
      await expect(
        invitationSchema.validate({
          ...input,
          email: `  ${email.toUpperCase()}  `,
        })
      ).resolves.toEqual({ ...input, email })
    }
  )

  it("rejects an email longer than 254 characters", async () => {
    const email = boundaryEmail(255)
    expect(email).toHaveLength(255)
    await expect(
      invitationSchema.validate({ ...input, email })
    ).rejects.toThrow("Email must be 254 characters or fewer.")
  })

  it("requires both fields", async () => {
    await expect(invitationSchema.isValid({ role: "learner" })).resolves.toBe(
      false
    )
    await expect(
      invitationSchema.isValid({ email: input.email })
    ).resolves.toBe(false)
  })
})
