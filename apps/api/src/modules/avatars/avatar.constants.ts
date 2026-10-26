export const AVATAR_MAX_WIDTH_PX = 512
export const AVATAR_MAX_BYTES = 6 * 1024 * 1024
/** A phone photo can be about 48 megapixels. Larger inputs are rejected. */
export const AVATAR_MAX_INPUT_PIXELS = 100_000_000
export const AVATAR_URL_MAX_LENGTH = 255

export const AVATAR_TOO_LARGE_MESSAGE = `Avatar must be ${AVATAR_MAX_BYTES / (1024 * 1024)} MB or smaller`
export const AVATAR_INVALID_TYPE_MESSAGE = 'Avatar must be a JPEG, PNG, WebP, or HEIC image'
