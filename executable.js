#!/usr/bin/env node
try {
    require('node-core-clang-format')();
} catch {
    require('.')();
}