import { Octokit } from "octokit";
import pkgJSON from './package.json' with { type: 'json' };
import fs from 'node:fs/promises';
import { exec } from 'node:child_process';

const octokit = new Octokit();

async function execAsync(cmd) {
    new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) reject(error);
            resolve({ stdout, stderr });
        });
    });
}

// Utility function to run wget and download files
const downloadWithWget = (url, outputPath) => {
    return execAsync(`wget -O ${outputPath} ${url}`);
};

const { data: { 0: latestRelease } } = await octokit.rest.repos.listReleases({
    owner: 'muttleyxd',
    repo: 'clang-tools-static-binaries',
    per_page: 1
});
const assets = await octokit.paginate(octokit.rest.repos.listReleaseAssets, {
    owner: 'muttleyxd',
    repo: 'clang-tools-static-binaries',
    release_id: latestRelease.id,
    per_page: 100
});

// git-clang-format
const gcfUrl = 'https://raw.githubusercontent.com/llvm/llvm-project/refs/heads/main/clang/tools/clang-format/git-clang-format';
await downloadWithWget(gcfUrl, './binaries/git-clang-format');

// Binaries
const CLANG_VERSION = 18;
const binaries = [
    ['darwin_x64', `clang-format-${CLANG_VERSION}_macosx-amd64`],
    ['linux_x64', `clang-format-${CLANG_VERSION}_linux-amd64`],
    ['win32', `clang-format-${CLANG_VERSION}_windows-amd64.exe`, '.exe']
]

for (const [folder, file, extension = ''] of binaries) {
    const binary = assets.find(asset => asset.name === file);
    if (binary) {
        const path = `binaries/${folder}/clang-format${extension}`;
        await downloadWithWget(binary.browser_download_url, path);
        if (!extension) await execAsync(`chmod 775 ${path}`);
        console.log(`Downloaded ${path}`);
    } else {
        console.error(`Binary for ${file} not found`);
    }
}

pkgJSON.version = latestRelease.tag_name.split('-')[1];
await fs.writeFile('package.json', JSON.stringify(pkgJSON, null, 2));