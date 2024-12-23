/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import * as main from '../src/main'
import { describe, it, expect, vi } from 'vitest'

// Mock the action's entrypoint
const runMock = vi.spyOn(main, 'run').mockImplementation(vi.fn())

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index')
    expect(runMock).toHaveBeenCalled()
  })
})
