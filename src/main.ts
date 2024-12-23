import * as core from '@actions/core'
import { arch } from 'os'
import { platform } from 'process'
import fs from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import path from 'path';

export async function run(): Promise<void> {
  try {
    // const ms: string = core.getInput('milliseconds')

    // // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // core.debug(`Waiting ${ms} milliseconds ...`)

    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())

    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())

    const currentArch = arch()
    const currentPlatform = platform

    console.log(`Current Arch: ${currentArch}`)
    console.log(`Current Platform: ${currentPlatform}`)

    const downloadFile = (async (url: string, fileName: string) => {
      const res = await fetch(url);
      if (!res.body) {
        throw new Error('Response body is undefined');
      }
      if (!fs.existsSync("downloads")) await mkdir("downloads"); //Optional if you already have downloads directory
      const destination = path.resolve("./downloads", fileName);
      const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
    });


    if (currentArch === 'x64' && currentPlatform === 'win32') {
      core.setFailed('You are using a 64-bit Windows machine')
    }
    else if (currentArch === 'x64' && currentPlatform === 'linux') {
      console.log('You are using a 64-bit Linux machine')
      await downloadFile("https://github.com/CynToolkit/pipelab/releases/download/v1.4.8/Pipelab-linux-x64-1.4.8.zip", "pipelab.zip")
    }
    else {
      core.setFailed('You are using an unsupported platform')
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
