import { expect } from '@playwright/test'
import type { ElectronApplication } from 'playwright'
import { test } from './fixtures/electron-app'
import { createProjectViaUi } from './fixtures/project'
import { submitPromptViaUi } from './fixtures/conversation'

// Inject the inconsistent presentation state without claiming to reproduce a provider's cause.
test.use({ windowMode: 'normal' })
for (const status of ['waiting-permission', 'waiting-for-user'] as const) {
  test(`keeps a draft usable during ${status} without a request`, async ({ app }, testInfo) => {
    await app.completeOnboarding()
    const page = await app.configureFakeAgent()
    await createProjectViaUi(page, 'Missing interaction recovery')
    await submitPromptViaUi(page, 'Summarize the deterministic fixture.')
    await expect(
      page.getByText('Deterministic reply: Summarize the deterministic fixture.', { exact: true })
    ).toBeVisible()
    const saved = await page.evaluate(async () => (await window.api.sessions.loadAll()).sessions[0])
    const session = {
      ...saved,
      id: 'missing-request',
      title: 'Missing request',
      conversationGraph: undefined,
      runtimeContext: undefined,
      activeRun: undefined
    }
    const application = (app as unknown as { application: ElectronApplication }).application
    const inject = async (nextStatus: typeof status | 'idle', revision: number): Promise<void> => {
      await application.evaluate(
        ({ BrowserWindow }, updated) => {
          BrowserWindow.getAllWindows()[0].webContents.send('session:updated', {
            session: updated,
            originClientId:
              updated.status === 'idle' ? 'main:permission-wait' : 'test:missing-request'
          })
        },
        { ...session, status: nextStatus, revision, updatedAt: Date.now() }
      )
    }
    await inject(status, (session.revision ?? 0) + 100)
    await page.locator('[data-session-id="missing-request"]').first().click()
    const form = page.getByTestId('ordinary-composer-form')
    const editor = page.getByRole('textbox', { name: 'Ask anything' })
    const notice = page.getByTestId('missing-interaction-notice')
    await expect(form).not.toHaveAttribute('inert')
    await expect(editor).toBeVisible()
    await expect(notice).toContainText('Waiting request unavailable')
    await expect(notice.getByRole('button', { name: 'Stop waiting', exact: true })).toBeEnabled()
    await expect(page.getByTestId('blocking-composer-overlay')).toHaveCount(0)
    await editor.fill('Keep this draft during recovery')
    const promptsBefore = await app.readFakeAgentPrompts()
    await editor.press('Enter')
    await expect(editor).toHaveText('Keep this draft during recovery')
    expect(await app.readFakeAgentPrompts()).toEqual(promptsBefore)
    await page.screenshot({ path: testInfo.outputPath('missing-request-recovery.png') })
    if (status === 'waiting-for-user') return
    await inject('idle', (session.revision ?? 0) + 101)
    await expect(notice).toHaveCount(0)
    await expect(editor).toHaveText('Keep this draft during recovery')
    await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled()
    await page.screenshot({ path: testInfo.outputPath('reconciled-draft.png') })
  })
}

test('stops a real permission wait when its request payload is lost in delivery', async ({
  app
}, testInfo) => {
  await app.completeOnboarding()
  const page = await app.configureFakeAgent()
  await createProjectViaUi(page, 'Lost permission delivery')
  const application = (app as unknown as { application: ElectronApplication }).application
  // Only the test window's delivered payloads lose request details; the backend retains the
  // actual pending permission, and Stop must travel through the production cancellation path.
  await application.evaluate(({ BrowserWindow }) => {
    const contents = BrowserWindow.getAllWindows()[0].webContents
    const send = contents.send.bind(contents)
    contents.send = (channel, ...args): void => {
      if (channel === 'acp:state' && args[0]) {
        args[0] = { ...args[0], pendingPermissions: [] }
      }
      if (channel === 'session:updated' && args[0]?.session?.runtimeContext?.permission) {
        const session = args[0].session
        const runtimeContext = { ...session.runtimeContext }
        delete runtimeContext.permission
        args[0] = { ...args[0], session: { ...session, runtimeContext } }
      }
      send(channel, ...args)
    }
  })
  await submitPromptViaUi(page, 'Request fixture permission.')
  await expect
    .poll(() =>
      page.evaluate(async () => (await window.api.acp.getState()).pendingPermissions.length)
    )
    .toBe(1)
  const saved = await page.evaluate(async () => (await window.api.sessions.loadAll()).sessions[0])
  // Recreate the renderer projection from a status-only snapshot, as in the original repro.
  // This does not delete or alter the backend Session or its pending permission.
  await application.evaluate(({ BrowserWindow }, session) => {
    const contents = BrowserWindow.getAllWindows()[0].webContents
    contents.send('session:deleted', { projectId: session.projectId, sessionId: session.id })
    contents.send('session:updated', {
      session: { ...session, status: 'waiting-permission', runtimeContext: undefined },
      originClientId: 'test:missing-request'
    })
  }, saved)
  await page.locator(`[data-session-id="${saved.id}"]`).first().click()
  const notice = page.getByTestId('missing-interaction-notice')
  await expect(notice).toBeVisible()
  const editor = page.getByRole('textbox', { name: 'Ask anything' })
  await editor.fill('Follow up after stopping')
  await page.screenshot({ path: testInfo.outputPath('lost-permission.png') })
  await notice.getByRole('button', { name: 'Stop waiting', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(async () => (await window.api.acp.getState()).pendingPermissions.length)
    )
    .toBe(0)
  await expect(notice).toHaveCount(0)
  await expect(editor).toHaveText('Follow up after stopping')
  await expect(page.getByRole('button', { name: 'Send message', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(
    page.getByText('Deterministic reply: Summarize the deterministic fixture.', { exact: true })
  ).toBeVisible()
  expect(JSON.stringify(await app.readFakeAgentPrompts())).toContain('Follow up after stopping')
  await page.screenshot({ path: testInfo.outputPath('stopped-and-followed-up.png') })
})
