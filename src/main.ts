import * as core from '@actions/core'
import * as github from '@actions/github'
import { arch } from 'os'
import { platform } from 'process'
import fs from 'fs';
import { mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import path from 'path';
import { createReadStream } from 'fs';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import unzipper from 'unzipper';
import execa from 'execa';

export async function run(): Promise<void> {
  try {
    const action = core.getInput('action');
    const project = core.getInput('project');
    let pipelabVersion = core.getInput('pipelab-version');

    console.log(`Action: ${action}`);
    console.log(`Project: ${project}`);
    console.log(`Pipelab Version: ${pipelabVersion}`);

    if (!pipelabVersion) {
      console.log('No Pipelab version specified, fetching the latest version...');
      const res = await fetch('https://api.github.com/repos/CynToolkit/pipelab/releases/latest');
      const latestRelease = await res.json();
      pipelabVersion = latestRelease.tag_name.replace('v', '');
      console.log(`Latest Pipelab Version: ${pipelabVersion}`);
    }

    const currentArch = arch();
    const currentPlatform = platform;

    console.log(`Current Arch: ${currentArch}`);
    console.log(`Current Platform: ${currentPlatform}`);

    const downloadFile = (async (url: string, fileName: string) => {
      console.log(`Downloading file from ${url} to ${fileName}`);
      const res = await fetch(url);
      if (!res.body) {
        throw new Error('Response body is undefined');
      }
      if (!fs.existsSync("downloads")) {
        console.log('Creating downloads directory...');
        await mkdir("downloads");
      }
      const destination = path.resolve("./downloads", fileName);
      const fileStream = fs.createWriteStream(destination, { flags: 'wx' });
      await finished(Readable.fromWeb(res.body).pipe(fileStream));
      console.log(`Downloaded file to ${destination}`);
    });

    const extractZip = async (filePath: string, extractTo: string) => {
      console.log(`Extracting zip file from ${filePath} to ${extractTo}`);
      await pipeline(
        createReadStream(filePath),
        unzipper.Extract({ path: extractTo })
      );
      console.log(`Extracted zip file to ${extractTo}`);
    };

    if (currentArch === 'x64' && currentPlatform === 'win32') {
      core.setFailed('You are using a 64-bit Windows machine');
    }
    else if (currentArch === 'x64' && currentPlatform === 'linux') {
      console.log('You are using a 64-bit Linux machine');
      await downloadFile(`https://github.com/CynToolkit/pipelab/releases/download/v${pipelabVersion}/Pipelab-linux-x64-${pipelabVersion}.zip`, "pipelab.zip");
      await extractZip("./downloads/pipelab.zip", "./downloads");

      const workspace = process.env.GITHUB_WORKSPACE || '';
      const jsonProject = path.resolve(workspace, project);
      const tmpLogFile = path.resolve('./downloads', 'log.txt');
      const args = ['--', '--project', jsonProject, '--action', action, '--output', tmpLogFile];

      console.log(`Running Pipelab with args: ${args.join(' ')}`);
      try {
        const { stdout } = await execa('./downloads/pipelab', args);
        console.log(stdout);
      } catch (error) {
        console.error(error.stderr);
        core.setFailed(error.stderr);
      }
    }
    else {
      core.setFailed('You are using an unsupported platform');
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) core.setFailed(error.message);
  }
}
