import { cn } from '@/lib/utils'

import { getExtensionPreservingFileNameParts } from './extension-preserving-file-name'

type ExtensionPreservingFileNameProps = {
  name: string
  className?: string
  compact?: boolean
}

// Gives the basename room to truncate while keeping its ending and common final extensions visible.
const ExtensionPreservingFileName = ({
  name,
  className,
  compact = false
}: ExtensionPreservingFileNameProps): React.JSX.Element => {
  const { head, tail, extension, isCompactAbbreviation } = getExtensionPreservingFileNameParts(
    name,
    compact
  )

  return (
    <span
      className={cn(
        'flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap',
        className
      )}
    >
      <span
        data-testid="file-name-head"
        className={cn('min-w-0', isCompactAbbreviation ? 'shrink-0' : 'flex-1 truncate')}
      >
        {head}
      </span>
      {isCompactAbbreviation ? (
        <span data-testid="file-name-ellipsis" className="shrink-0">
          ...
        </span>
      ) : null}
      {tail ? (
        <span data-testid="file-name-tail" className="shrink-0">
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
