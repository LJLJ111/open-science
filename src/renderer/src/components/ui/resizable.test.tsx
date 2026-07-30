import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const resizablePath = resolve(__dirname, 'resizable.tsx')
const workspacePagePath = resolve(__dirname, '../../pages/workspace/WorkspacePage.tsx')

describe('ResizableHandle hover indicator', () => {
  // CSS :hover drives the tick; keep active so it stays visible while dragging.
  it('shows a thin centered tick on separator hover by default', () => {
    const source = readFileSync(resizablePath, 'utf8')

    expect(source).toContain('hover:before:opacity-60')
    expect(source).toContain('data-[separator=active]:before:opacity-60')
    expect(source).toContain("after:content-['']")
    expect(source).toContain('after:w-3')
    expect(source).toContain('before:opacity-0')
    expect(source).toContain('before:left-1/2')
    expect(source).toContain('before:z-10')
    expect(source).toContain('before:h-8')
    expect(source).toContain('before:w-0.5')
    expect(source).toContain('before:rounded-full')
    expect(source).toContain('before:bg-text-300')
    expect(source).not.toContain('before:w-1')
    expect(source).not.toContain('before:right-full')
    expect(source).not.toContain('data-[separator=focus]')
    expect(source).not.toContain('event.currentTarget.blur()')
    expect(source).not.toContain('before:transition-opacity')
    expect(source).not.toContain('hover:before:opacity-100')
  })

  // Only the preview edge uses a thicker tick to the left of the always-on divider.
  it('thickens the right preview tick and places it left of the divider', () => {
    const source = readFileSync(workspacePagePath, 'utf8')

    expect(source).toContain('before:right-full')
    expect(source).toContain('before:mr-0.5')
    expect(source).toContain('before:w-1')
    expect(source).toContain('before:left-auto')
    expect(source).toContain('before:translate-x-0')
  })

  // Keep the left tick flush with the sidebar card edge (3px inset from the separator).
  it('pins the left sidebar tick to the panel right edge', () => {
    const source = readFileSync(workspacePagePath, 'utf8')

    expect(source).toContain('aria-label="Resize left panel"')
    expect(source).toMatch(
      /aria-label="Resize left panel"[\s\S]*?before:left-auto before:right-full before:mr-\[3px\] before:translate-x-0/
    )
  })
})
