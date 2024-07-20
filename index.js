const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const PLATFORM = os.platform();
const ARCH = os.arch();
const BASE_DIR = 'binaries';

function getNativeBinary() {
    const possibleBinaries = [
        `${BASE_DIR}/${PLATFORM}_${ARCH}/clang-format`,
        PLATFORM === 'win32' ? `${BASE_DIR}/win32/clang-format.exe` : null,
        PLATFORM === 'darwin' && ARCH === 'arm64' ? `${BASE_DIR}/darwin_x64/clang-format` : null
    ].filter(Boolean);

    for (const binary of possibleBinaries) {
        if (fs.existsSync(binary)) {
            return path.resolve(__dirname, binary);
        }
    }

    throw new Error(`No executable found (${PLATFORM}_${ARCH}).`);
}

function main() {
    try {
        const binaryPath = getNativeBinary();
        const spawned = child_process.spawn(binaryPath, process.argv.slice(2), { stdio: 'inherit' });
        spawned.on('close', process.exit);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}

if (require.main === module) main();