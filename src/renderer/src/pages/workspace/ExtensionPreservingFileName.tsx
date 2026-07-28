import { cn } from '@/lib/utils'

type ExtensionPreservingFileNameProps = {
  name: string
  className?: string
}

// Gives the basename room to truncate while keeping common final extensions fully visible.
const ExtensionPreservingFileName = ({
  name,
  className
}: ExtensionPreservingFileNameProps): React.JSX.Element => {
  const extensionIndex = name.lastIndexOf('.')
  const hasExtension = extensionIndex > 0
  const prefix = hasExtension ? name.slice(0, extensionIndex) : name
  const extension = hasExtension ? name.slice(extensionIndex) : ''

  return (
    <span
      className={cn(
        'flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap',
        className
      )}
    >
      <span data-testid="file-name-prefix" className="min-w-0 flex-1 truncate">
        {prefix}
      </span>
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
