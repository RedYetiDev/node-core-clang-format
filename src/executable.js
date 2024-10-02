#!/usr/bin/env node
let nccf;
try {
    nccf = require('node-core-clang-format');
} catch {
    nccf = require('.');
}

if (nccf) {
    nccf() 
} else throw new Error("Could not find node-core-clang-format")