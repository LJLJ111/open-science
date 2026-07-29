import { cn } from '@/lib/utils'

type ExtensionPreservingFileNameProps = {
  name: string
  className?: string
}

const BASENAME_TAIL_LENGTH = 11

// Gives the basename room to truncate while keeping its ending and common final extensions visible.
const ExtensionPreservingFileName = ({
  name,
  className
}: ExtensionPreservingFileNameProps): React.JSX.Element => {
  const extensionIndex = name.lastIndexOf('.')
  const hasExtension = extensionIndex > 0
  const basename = hasExtension ? name.slice(0, extensionIndex) : name
  const extension = hasExtension ? name.slice(extensionIndex) : ''
  const hasLongBasename = basename.length > BASENAME_TAIL_LENGTH
  // Split only long names so short filenames retain their original, uninterrupted rendering.
  const head = hasLongBasename ? basename.slice(0, -BASENAME_TAIL_LENGTH) : basename
  const tail = hasLongBasename ? basename.slice(-BASENAME_TAIL_LENGTH) : ''

  return (
    <span
      className={cn(
        'flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap',
        className
      )}
    >
      <span data-testid="file-name-head" className="min-w-0 flex-1 truncate">
        {head}
      </span>
      {tail ? (
        <span
          data-testid="file-name-tail"
          className="max-w-[50%] shrink-0 overflow-hidden text-ellipsis"
        >
          {tail}
        </span>
      ) : null}
      {extension ? (
        <span
          data-testid="file-name-extension"
          className="max-w-[50%] shrink-0 overflow-hidden text-ellipsis"
        >
          {extension}
        </span>
      ) : null}
    </span>
  )
}

export { ExtensionPreservingFileName }
