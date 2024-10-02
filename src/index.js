const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const PLATFORM = os.platform();
const ARCH = os.arch();

function getNativeBinary() {
    const possibleBinaries = [
        `${PLATFORM}_${ARCH}/clang-format`,
        PLATFORM === 'win32' ? `win32/clang-format.exe` : null,
        PLATFORM === 'darwin' && ARCH === 'arm64' ? `darwin_x64/clang-format` : null
    ].filter(Boolean).map(binary => path.resolve(__dirname, '..', 'binaries', binary));
    for (const binary of possibleBinaries) if (fs.existsSync(binary)) return binary;

    throw new Error(`No executable found (${PLATFORM}_${ARCH}).`);
}

module.exports = function() {
    try {
        child_process
            .spawn(getNativeBinary(), process.argv.slice(2), { stdio: 'inherit' })
            .on('close', process.exit);
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
}
