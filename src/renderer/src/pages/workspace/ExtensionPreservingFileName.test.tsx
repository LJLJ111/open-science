// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ExtensionPreservingFileName } from './ExtensionPreservingFileName'

describe('ExtensionPreservingFileName', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
  })

  const renderName = (name: string): void => {
    act(() => root.render(<ExtensionPreservingFileName name={name} />))
  }

  it('keeps the basename tail and final extension visible for a long filename', () => {
    renderName('very_long_experiment_analysis_result_2025.csv')

    expect(container.querySelector('[data-testid="file-name-head"]')?.textContent).toBe(
      'very_long_experiment_analysis_result'
    )
    expect(container.querySelector('[data-testid="file-name-tail"]')?.textContent).toBe('_2025')
    expect(container.querySelector('[data-testid="file-name-ellipsis"]')).toBeNull()
    expect(container.querySelector('[data-testid="file-name-extension"]')?.textContent).toBe('.csv')
  })

  it.each(['README', '.env'])('truncates %s as one name without an extension suffix', (name) => {
    renderName(name)

    expect(container.textContent).toBe(name)
    expect(container.querySelector('[data-testid="file-name-extension"]')).toBeNull()
  })

  it('keeps a short filename complete', () => {
    renderName('note.md')

    expect(container.textContent).toBe('note.md')
  })

  it('uses a shorter abbreviation in compact file cards', () => {
    act(() =>
      root.render(
        <ExtensionPreservingFileName name="very_long_experiment_analysis_result_2025.csv" compact />
      )
    )

    expect(container.textContent).toBe('ver...5.csv')
  })

  it('reserves room for the basename head when an extension is unusually long', () => {
    renderName('sample.verylongcustomextension')

    expect(container.querySelector('[data-testid="file-name-head"]')?.className).toContain('flex-1')
    const extension = container.querySelector('[data-testid="file-name-extension"]')
    expect(extension?.className).toContain('max-w-[50%]')
    expect(extension?.className).toContain('text-ellipsis')
  })
})
