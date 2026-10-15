import {
  emailPurposeOptions,
  emailStatusOptions,
  type EmailDeliveryTableParams,
  type EmailPurpose,
} from "./email-delivery"
import type { EmailDeliveryStatus } from "@workspace/data"

export interface EmailDeliverySearchState {
  recipient?: string
  status?: EmailDeliveryStatus
  purpose?: EmailPurpose
  page?: number
  pageSize?: number
  modal?: "details"
  message?: string
}
function positiveInteger(value: unknown, maximum: number, fallback: number) {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value)
        ? Number(value)
        : NaN
  return Number.isSafeInteger(number) && number > 0 && number <= maximum
    ? number
    : fallback
}
export function validateEmailDeliverySearch(
  search: Record<string, unknown>
): EmailDeliverySearchState {
  const recipient =
    typeof search.recipient === "string"
      ? search.recipient.slice(0, 254).trim().toLowerCase()
      : ""
  const status = emailStatusOptions.find(
    (option) => option.value === search.status
  )?.value
  const purpose = emailPurposeOptions.find(
    (option) => option.value === search.purpose
  )?.value
  const page = positiveInteger(search.page, 1_000_000, 1)
  const size = positiveInteger(search.pageSize, 100, 20)
  const pageSize = [10, 20, 50, 100].includes(size) ? size : 20
  const message =
    typeof search.message === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      search.message
    )
      ? search.message
      : undefined
  const details = search.modal === "details" && !!message
  return {
    recipient: recipient || undefined,
    status,
    purpose,
    page: page === 1 ? undefined : page,
    pageSize: pageSize === 20 ? undefined : pageSize,
    modal: details ? "details" : undefined,
    message: details ? message : undefined,
  }
}
export function emailDeliveryParamsFromSearch(
  search: EmailDeliverySearchState
): EmailDeliveryTableParams {
  return {
    recipient: search.recipient ?? "",
    status: search.status ?? "all",
    purpose: search.purpose ?? "all",
    pageIndex: (search.page ?? 1) - 1,
    pageSize: search.pageSize ?? 20,
  }
}
export function updateEmailDeliverySearch(
  previous: EmailDeliverySearchState,
  patch: Partial<EmailDeliverySearchState>
) {
  return validateEmailDeliverySearch({ ...previous, ...patch })
}
