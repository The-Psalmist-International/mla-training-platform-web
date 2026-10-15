// Same unsigned Cloudinary upload setup used by POS platform web.
const CLOUD_NAME = "dviigplcx"
const UPLOAD_PRESET = "domus-console"

export class ImageUploadError extends Error {}

export function validateImageFile(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new ImageUploadError("Use JPEG, PNG, or WebP.")
  if (!file.size || file.size > 5 * 1024 * 1024)
    throw new ImageUploadError("Choose an image no larger than 5 MiB.")
}

export async function uploadImage(file: File) {
  validateImageFile(file)
  const data = new FormData()
  data.append("file", file)
  data.append("upload_preset", UPLOAD_PRESET)
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: data }
    )
    if (!response.ok) throw new Error("Upload failed")
    const result = (await response.json()) as { secure_url?: unknown }
    if (typeof result.secure_url !== "string")
      throw new Error("Missing image URL")
    const url = new URL(result.secure_url)
    if (
      url.protocol !== "https:" ||
      url.hostname !== "res.cloudinary.com" ||
      !url.pathname.startsWith(`/${CLOUD_NAME}/image/upload/`) ||
      url.username ||
      url.password
    )
      throw new Error("Invalid image URL")
    return url.href
  } catch {
    throw new ImageUploadError("The image upload failed. Try again.")
  }
}
