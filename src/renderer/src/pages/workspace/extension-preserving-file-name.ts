type ExtensionPreservingFileNameParts = {
  head: string
  tail: string
  extension: string
  isCompactAbbreviation: boolean
}

const COMPACT_BASENAME_MIN_LENGTH = 24
const DEFAULT_TAIL_LENGTH = 5
const CARD_HEAD_LENGTH = 3
const CARD_TAIL_LENGTH = 1

// Keeps a small basename tail outside the flex-truncated head so normal surfaces respond to width.
const getExtensionPreservingFileNameParts = (
  name: string,
  compact = false
): ExtensionPreservingFileNameParts => {
  const extensionIndex = name.lastIndexOf('.')
  const hasExtension = extensionIndex > 0
  const basename = hasExtension ? name.slice(0, extensionIndex) : name
  const extension = hasExtension ? name.slice(extensionIndex) : ''
  const isCompactAbbreviation = compact && basename.length >= COMPACT_BASENAME_MIN_LENGTH

  if (isCompactAbbreviation) {
    return {
      head: basename.slice(0, CARD_HEAD_LENGTH),
      tail: basename.slice(-CARD_TAIL_LENGTH),
      extension,
      isCompactAbbreviation
    }
  }

  return {
    head: basename.slice(0, -DEFAULT_TAIL_LENGTH),
    tail: basename.slice(-DEFAULT_TAIL_LENGTH),
    extension,
    isCompactAbbreviation
  }
}

export { getExtensionPreservingFileNameParts }
export type { ExtensionPreservingFileNameParts }
