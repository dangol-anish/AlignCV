#!/usr/bin/env bash
# exit on error
set -o errexit

# Install Google Chrome
apt-get update && apt-get install -y google-chrome-stable

# Your existing build commands
npm install
npm run build
npm run postbuild 