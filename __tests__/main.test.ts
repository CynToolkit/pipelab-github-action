/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { describe, it, beforeEach, expect, vi } from 'vitest'

// Mock the action's main function
const runMock = vi.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

// Mock the GitHub Actions core library
let debugMock: ReturnType<typeof vi.spyOn>
let errorMock: ReturnType<typeof vi.spyOn>
let getInputMock: ReturnType<typeof vi.spyOn>
let setFailedMock: ReturnType<typeof vi.spyOn>
let setOutputMock: ReturnType<typeof vi.spyOn>

describe('action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    debugMock = vi.spyOn(core, 'debug').mockImplementation()
    errorMock = vi.spyOn(core, 'error').mockImplementation()
    getInputMock = vi.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = vi.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = vi.spyOn(core, 'setOutput').mockImplementation()
  })


  it('sets a failed status for unsupported platform', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'action':
          return 'test-action'
        case 'project':
          return 'test-project'
        case 'pipelab-version':
          return '1.0.0'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that the core.setFailed function was called correctly
    expect(setFailedMock).toHaveBeenCalledWith('You are using an unsupported platform')
    expect(errorMock).not.toHaveBeenCalled()
  })
})
